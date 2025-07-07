using Microsoft.AspNetCore.Mvc;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectTaskController(AppDBContext dbContext) : ControllerBase
    {
        private readonly AppDBContext _context = dbContext;

        [HttpGet]
        public IActionResult GetAllProjectTasks()
        {
            var tasks = _context.ProjectTasks.ToList();
            var tasksDTO = new List<ProjectTaskDTO>();

            foreach (var task in tasks)
            {
                tasksDTO.Add(
                    new ProjectTaskDTO
                    {
                        ProjectTaskId = task.ProjectTaskId,
                        ProjectId = task.ProjectId,
                        TaskName = task.TaskName,
                        PIC = task.PIC,
                        Deadline = task.Deadline,
                        Description = task.Description,
                        Status = task.Status,
                        Priority = task.Priority,
                    }
                );
            }

            return Ok(tasksDTO);
        }

        [HttpGet]
        [Route("{id:guid}")]
        public IActionResult GetProjectTaskById([FromRoute] Guid id)
        {
            var task = _context.ProjectTasks.FirstOrDefault(t => t.ProjectTaskId == id);

            if (task == null)
            {
                return NotFound();
            }

            var taskDTO = new ProjectTaskDTO
            {
                ProjectTaskId = task.ProjectTaskId,
                ProjectId = task.ProjectId,
                TaskName = task.TaskName,
                PIC = task.PIC,
                Deadline = task.Deadline,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
            };

            return Ok(taskDTO);
        }

        [HttpPost]
        public IActionResult AddProjectTask(
            [FromBody] CreateProjectTaskRequestDTO createProjectTaskRequestDTO
        )
        {
            if (createProjectTaskRequestDTO == null)
            {
                return BadRequest("Project task data is null.");
            }

            var task = new ProjectTask
            {
                ProjectTaskId =
                    createProjectTaskRequestDTO.ProjectTaskId != Guid.Empty
                        ? createProjectTaskRequestDTO.ProjectTaskId
                        : Guid.NewGuid(),
                ProjectId = createProjectTaskRequestDTO.ProjectId,
                TaskName = createProjectTaskRequestDTO.TaskName,
                PIC = createProjectTaskRequestDTO.PIC,
                Deadline = createProjectTaskRequestDTO.Deadline,
                Description = createProjectTaskRequestDTO.Description,
                Status = createProjectTaskRequestDTO.Status,
                Priority = createProjectTaskRequestDTO.Priority,
            };

            _context.ProjectTasks.Add(task);
            _context.SaveChanges();

            return CreatedAtAction(
                nameof(GetProjectTaskById),
                new { id = task.ProjectTaskId },
                task
            );
        }

        [HttpPut]
        [Route("{id:guid}")]
        public IActionResult UpdateProjectTaskById(
            [FromRoute] Guid id,
            [FromBody] UpdateProjectTaskRequestDTO updateProjectTaskRequestDTO
        )
        {
            var task = _context.ProjectTasks.FirstOrDefault(t => t.ProjectTaskId == id);

            if (task == null)
            {
                return NotFound();
            }

            // Optionally, ensure the DTO ProjectTaskId matches the route Id
            if (
                updateProjectTaskRequestDTO.ProjectTaskId != Guid.Empty
                && updateProjectTaskRequestDTO.ProjectTaskId != id
            )
            {
                return BadRequest("ProjectTaskId in body does not match ProjectTaskId in route.");
            }

            // Update properties
            task.ProjectId = updateProjectTaskRequestDTO.ProjectId;
            task.TaskName = updateProjectTaskRequestDTO.TaskName;
            task.PIC = updateProjectTaskRequestDTO.PIC;
            task.Deadline = updateProjectTaskRequestDTO.Deadline;
            task.Description = updateProjectTaskRequestDTO.Description;
            task.Status = updateProjectTaskRequestDTO.Status;
            task.Priority = updateProjectTaskRequestDTO.Priority;
            _context.SaveChanges();

            return Ok(task);
        }

        [HttpDelete]
        [Route("{id:guid}")]
        public IActionResult DeleteProjectTaskById([FromRoute] Guid id)
        {
            var task = _context.ProjectTasks.FirstOrDefault(t => t.ProjectTaskId == id);

            if (task == null)
            {
                return NotFound();
            }
            _context.ProjectTasks.Remove(task);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
