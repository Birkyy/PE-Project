using Microsoft.AspNetCore.Mvc;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskCommentController(AppDBContext dbContext) : ControllerBase
    {
        private readonly AppDBContext _context = dbContext;

        [HttpGet]
        [Route("{taskId:guid}")]
        public IActionResult GetCommentsFromTaskId([FromRoute] Guid taskId)
        {
            var comments = _context
                .TaskComments.Where(c => c.ProjectTaskId == taskId)
                .OrderBy(c => c.CreatedAt)
                .ToList();

            // Use join to get usernames
            var users = _context.Users.ToDictionary(u => u.UserId, u => u.Username);

            var commentsDTO = comments
                .Select(c => new TaskCommentDTO
                {
                    TaskCommentId = c.TaskCommentId,
                    ProjectTaskId = c.ProjectTaskId,
                    Comment = c.Comment,
                    UserId = c.UserId,
                    CreatedAt = c.CreatedAt,
                    Username = users.ContainsKey(c.UserId) ? users[c.UserId] : null,
                })
                .ToList();

            return Ok(commentsDTO);
        }

        [HttpPost]
        public IActionResult AddTaskComment(
            [FromBody] CreateTaskCommentRequestDTO createTaskCommentRequestDTO
        )
        {
            if (createTaskCommentRequestDTO == null)
            {
                return BadRequest("Task comment data is null.");
            }

            var taskComment = new TaskComment
            {
                TaskCommentId = Guid.NewGuid(),
                ProjectTaskId = createTaskCommentRequestDTO.ProjectTaskId,
                Comment = createTaskCommentRequestDTO.Comment,
                UserId = createTaskCommentRequestDTO.UserId,
                CreatedAt = DateTime.UtcNow,
            };

            _context.TaskComments.Add(taskComment);
            _context.SaveChanges();

            // Send notification to task assignee
            SendCommentNotification(taskComment);

            // Optional: include user info
            var user = _context.Users.FirstOrDefault(u => u.UserId == taskComment.UserId);

            var taskCommentDTO = new TaskCommentDTO
            {
                TaskCommentId = taskComment.TaskCommentId,
                ProjectTaskId = taskComment.ProjectTaskId,
                Comment = taskComment.Comment,
                UserId = taskComment.UserId,
                CreatedAt = taskComment.CreatedAt,
                Username = user?.Username,
            };

            return CreatedAtAction(
                nameof(GetCommentsFromTaskId),
                new { taskId = taskComment.ProjectTaskId },
                taskCommentDTO
            );
        }

        private void SendCommentNotification(TaskComment taskComment)
        {
            try
            {
                // Get the task to find the assignee
                var task = _context.ProjectTasks.FirstOrDefault(t =>
                    t.ProjectTaskId == taskComment.ProjectTaskId
                );
                if (task == null)
                    return;

                // Get the commenter's name
                var commenter = _context.Users.FirstOrDefault(u => u.UserId == taskComment.UserId);
                var commenterName = commenter?.Username ?? "Unknown User";

                // Get the task assignee
                var assignee = _context.Users.FirstOrDefault(u => u.UserId == task.PIC);
                if (assignee == null || assignee.UserId == taskComment.UserId)
                    return; // Don't notify if commenter is assignee

                // Create notification for task assignee
                var notification = new Notification
                {
                    NotificationId = Guid.NewGuid(),
                    UserId = assignee.UserId,
                    Title = "New Comment on Your Task",
                    Message = $"{commenterName} commented on task: {task.TaskName}",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false,
                };

                _context.Notifications.Add(notification);
                _context.SaveChanges();

                Console.WriteLine(
                    $"Notification sent to {assignee.Username} for comment on task {task.TaskName}"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending comment notification: {ex.Message}");
            }
        }

        [HttpPut("{id:guid}")]
        public IActionResult UpdateTaskComment(
            [FromRoute] Guid id,
            [FromBody] UpdateTaskCommentRequestDTO updateTaskCommentRequestDTO
        )
        {
            Console.WriteLine($"UpdateTaskComment called with id: {id}");
            Console.WriteLine(
                $"Request body: {System.Text.Json.JsonSerializer.Serialize(updateTaskCommentRequestDTO)}"
            );

            var comment = _context.TaskComments.FirstOrDefault(c => c.TaskCommentId == id);

            if (comment == null)
            {
                Console.WriteLine($"Comment not found with id: {id}");
                return NotFound();
            }

            Console.WriteLine($"Found comment: {comment.Comment}");
            comment.Comment = updateTaskCommentRequestDTO.Comment;
            _context.SaveChanges();
            Console.WriteLine($"Comment updated to: {comment.Comment}");

            // Get user info for response
            var user = _context.Users.FirstOrDefault(u => u.UserId == comment.UserId);

            var taskCommentDTO = new TaskCommentDTO
            {
                TaskCommentId = comment.TaskCommentId,
                ProjectTaskId = comment.ProjectTaskId,
                Comment = comment.Comment,
                UserId = comment.UserId,
                CreatedAt = comment.CreatedAt,
                Username = user?.Username,
            };

            Console.WriteLine($"Returning updated comment DTO");
            return Ok(taskCommentDTO);
        }

        [HttpDelete]
        [Route("{id:guid}")]
        public IActionResult DeleteTaskCommentById([FromRoute] Guid id)
        {
            var comment = _context.TaskComments.FirstOrDefault(c => c.TaskCommentId == id);

            if (comment == null)
            {
                return NotFound();
            }

            _context.TaskComments.Remove(comment);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
