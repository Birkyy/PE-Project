using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController(AppDBContext dbContext) : ControllerBase
    {
        private readonly AppDBContext _context = dbContext;

        [HttpGet]
        [Route("user/{userId:guid}")]
        public IActionResult GetProjectsByUserId(Guid userId)
        {
            var userProjects = _context
                .UserProjects.Where(up => up.UserId == userId)
                .Select(up => up.Project)
                .Select(p => new ProjectDTO
                {
                    ProjectId = p.ProjectId,
                    Name = p.Name,
                    CreatedAt = p.CreatedAt,
                    Status = p.Status,
                })
                .ToList();

            if (!userProjects.Any())
            {
                return NotFound($"No projects found for user with ID {userId}");
            }

            var userProjectDTO = new UserProjectDTO { UserId = userId, Projects = userProjects };

            return Ok(userProjectDTO);
        }

        [HttpGet]
        [Route("{projectId:guid}")]
        public IActionResult GetUsersByProjectId(Guid projectId)
        {
            var projectUsers = _context
                .UserProjects.Where(up => up.ProjectId == projectId)
                .Select(up => new UserWithProjectRoleDTO
                {
                    UserId = up.User.UserId,
                    Email = up.User.Email,
                    Username = up.User.Username,
                    Role = up.User.Role,
                    ProjectRole = up.ProjectRole,
                })
                .ToList();

            if (!projectUsers.Any())
            {
                return NotFound($"No users found for project with ID {projectId}");
            }

            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == projectId);

            if (project == null)
            {
                return NotFound($"Project with ID {projectId} not found.");
            }

            var projectWithUsersDTO = new ProjectWithUsersDTO
            {
                ProjectId = project.ProjectId,
                Name = project.Name,
                CreatedAt = project.CreatedAt,
                Status = project.Status,
                Users = projectUsers,
            };

            return Ok(projectWithUsersDTO);
        }

        [HttpPost]
        public IActionResult AddProject([FromBody] CreateProjectRequestDTO createProjectRequestDTO)
        {
            var creatorUserId = createProjectRequestDTO.Users.First().UserId;

            if (createProjectRequestDTO == null)
            {
                return BadRequest("Project data is required.");
            }

            var project = new Project
            {
                ProjectId = Guid.NewGuid(),
                Name = createProjectRequestDTO.Name,
                Description = createProjectRequestDTO.Description,
                CreatedAt = DateTime.UtcNow,
                DueDate = createProjectRequestDTO.DueDate,
                Priority = createProjectRequestDTO.Priority,
                Status = createProjectRequestDTO.Status,
            };

            _context.Projects.Add(project);

            foreach (var userDto in createProjectRequestDTO.Users)
            {
                var userProject = new UserProject
                {
                    UserId = userDto.UserId,
                    ProjectId = project.ProjectId,
                    ProjectRole = userDto.ProjectRole,
                };

                _context.UserProjects.Add(userProject);
            }

            _context.SaveChanges();

            return CreatedAtAction(
                nameof(GetProjectsByUserId),
                new { userId = creatorUserId },
                project
            );
        }
    }
}
