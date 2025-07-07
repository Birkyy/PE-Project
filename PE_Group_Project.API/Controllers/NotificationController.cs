using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class NotificationController(AppDBContext dbContext) : ControllerBase
    {
        private readonly AppDBContext _context = dbContext;

        [HttpGet]
        [Route("{userId:guid}")]
        public IActionResult GetUserNotifications(Guid userId)
        {
            Console.WriteLine($"GetUserNotifications called with userId: {userId}");

            try
            {
                var notifications = _context
                    .Notifications.Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToList();

                Console.WriteLine($"Found {notifications.Count} notifications for user {userId}");

                var notificationDTOs = notifications
                    .Select(n => new NotificationDTO
                    {
                        NotificationId = n.NotificationId,
                        UserId = n.UserId,
                        Title = n.Title,
                        Message = n.Message,
                        CreatedAt = n.CreatedAt,
                        IsRead = n.IsRead,
                    })
                    .ToList();

                Console.WriteLine($"Returning {notificationDTOs.Count} notification DTOs");
                return Ok(notificationDTOs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserNotifications: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public IActionResult AddNotification([FromBody] NotificationDTO notificationDTO)
        {
            if (notificationDTO == null)
            {
                return BadRequest("Notification data is null.");
            }

            var notification = new Notification
            {
                NotificationId = Guid.NewGuid(),
                UserId = notificationDTO.UserId,
                Title = notificationDTO.Title,
                Message = notificationDTO.Message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
            };

            _context.Notifications.Add(notification);
            _context.SaveChanges();

            return CreatedAtAction(
                nameof(GetUserNotifications),
                new { userId = notification.UserId },
                notification
            );
        }

        [HttpPut]
        [Route("{notificationId:guid}")]
        public IActionResult MarkNotificationAsRead(Guid notificationId)
        {
            var notification = _context.Notifications.FirstOrDefault(n =>
                n.NotificationId == notificationId
            );

            if (notification == null)
            {
                return NotFound($"Notification with ID: {notificationId} not found.");
            }

            notification.IsRead = true;
            _context.SaveChanges();

            return NoContent();
        }

        [HttpDelete]
        [Route("{notificationId:guid}")]
        public IActionResult DeleteNotification(Guid notificationId)
        {
            var notification = _context.Notifications.FirstOrDefault(n =>
                n.NotificationId == notificationId
            );

            if (notification == null)
            {
                return NotFound($"Notification with ID: {notificationId} not found.");
            }

            _context.Notifications.Remove(notification);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
