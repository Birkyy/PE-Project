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

            if (!comments.Any())
            {
                return NotFound();
            }

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
