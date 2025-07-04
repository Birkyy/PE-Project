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
        public IActionResult GetAllProjects()
        {
            var projects = _context.Projects.ToList();
            var projectsDTO = new List<ProjectDTO>();

            foreach (var project in projects)
            {
                projectsDTO.Add(
                    new ProjectDTO
                    {
                        ProjectId = project.ProjectId,
                        ProjectName = project.ProjectName,
                        Date = project.Date,
                        Status = project.Status,
                        PriorityLevel = project.PriorityLevel,
                        ProjectManagerInCharge = project.ProjectManagerInCharge,
                        Contributors = _context
                            .UserProjects.Where(up =>
                                up.ProjectId == project.ProjectId && up.ProjectRole == "Contributor"
                            )
                            .Select(up => up.UserId)
                            .ToList(),
                    }
                );
            }

            return Ok(projectsDTO);
        }

        [HttpGet]
        [Route("{id:guid}")]
        public IActionResult GetProjectById([FromRoute] Guid id)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            var projectDTO = new ProjectDTO
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                Date = project.Date,
                Status = project.Status,
                PriorityLevel = project.PriorityLevel,
                ProjectManagerInCharge = project.ProjectManagerInCharge,
                Contributors = _context
                    .UserProjects.Where(up =>
                        up.ProjectId == project.ProjectId && up.ProjectRole == "Contributor"
                    )
                    .Select(up => up.UserId)
                    .ToList(),
            };

            return Ok(projectDTO);
        }

        [HttpGet]
        [Route("user/{id:guid}")]
        public IActionResult GetProjectsByUserId([FromRoute] Guid id)
        {
            var userProjects = _context
                .UserProjects.Where(up => up.UserId == id)
                .Select(up => up.Project)
                .ToList();

            var projectDTOs = userProjects
                .Select(project => new ProjectDTO
                {
                    ProjectId = project.ProjectId,
                    ProjectName = project.ProjectName,
                    Date = project.Date,
                    Status = project.Status,
                    PriorityLevel = project.PriorityLevel,
                    ProjectManagerInCharge = project.ProjectManagerInCharge,
                    Contributors = _context
                        .UserProjects.Where(up =>
                            up.ProjectId == project.ProjectId && up.ProjectRole == "Contributor"
                        )
                        .Select(up => up.UserId)
                        .ToList(),
                })
                .ToList();

            return Ok(projectDTOs);
        }

        [HttpPost]
        public IActionResult AddProject([FromBody] CreateProjectRequestDTO createProjectRequestDTO)
        {
            if (createProjectRequestDTO == null)
            {
                return BadRequest("Project data is null.");
            }

            var project = new Project
            {
                ProjectId =
                    createProjectRequestDTO.ProjectId != Guid.Empty
                        ? createProjectRequestDTO.ProjectId
                        : Guid.NewGuid(),
                ProjectName = createProjectRequestDTO.ProjectName,
                Date = createProjectRequestDTO.Date,
                Status = createProjectRequestDTO.Status,
                PriorityLevel = createProjectRequestDTO.PriorityLevel,
                ProjectManagerInCharge = createProjectRequestDTO.ProjectManagerInCharge,
            };

            _context.Projects.Add(project);

            // Create a list to track all user-project relationships
            var userProjects = new List<UserProject>();

            // Add UserProject entries for contributors (excluding manager)
            foreach (var contributorId in createProjectRequestDTO.Contributors)
            {
                // Skip if this contributor is the manager
                if (contributorId == createProjectRequestDTO.ProjectManagerInCharge)
                {
                    continue;
                }

                // Check if this user is already added (avoid duplicate entries)
                if (
                    !userProjects.Any(up =>
                        up.UserId == contributorId && up.ProjectId == project.ProjectId
                    )
                )
                {
                    userProjects.Add(
                        new UserProject
                        {
                            ProjectId = project.ProjectId,
                            UserId = contributorId,
                            ProjectRole = "Contributor",
                        }
                    );
                }
            }

            // Always add project manager as Manager
            userProjects.Add(
                new UserProject
                {
                    ProjectId = project.ProjectId,
                    UserId = createProjectRequestDTO.ProjectManagerInCharge,
                    ProjectRole = "Manager",
                }
            );

            // Add all user projects to context
            _context.UserProjects.AddRange(userProjects);

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error saving project: {ex.Message}");
            }

            // Return only the project data (not the full entity with navigation properties)
            var projectDTO = new ProjectDTO
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                Date = project.Date,
                Status = project.Status,
                PriorityLevel = project.PriorityLevel,
                ProjectManagerInCharge = project.ProjectManagerInCharge,
                Contributors = userProjects
                    .Where(up => up.ProjectRole == "Contributor")
                    .Select(up => up.UserId)
                    .ToList(),
            };

            return CreatedAtAction(
                nameof(GetProjectById),
                new { id = project.ProjectId },
                projectDTO
            );
        }

        [HttpPut]
        [Route("{id:guid}")]
        public IActionResult UpdateProjectById(
            [FromRoute] Guid id,
            [FromBody] UpdateProjectRequestDTO updateProjectRequestDTO
        )
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            // Optionally, ensure the DTO ProjectId matches the route Id
            if (
                updateProjectRequestDTO.ProjectId != Guid.Empty
                && updateProjectRequestDTO.ProjectId != id
            )
            {
                return BadRequest("ProjectId in body does not match ProjectId in route.");
            }

            // Update properties
            project.ProjectName = updateProjectRequestDTO.ProjectName;
            project.Date = updateProjectRequestDTO.Date;
            project.Status = updateProjectRequestDTO.Status;
            project.PriorityLevel = updateProjectRequestDTO.PriorityLevel;
            project.ProjectManagerInCharge = updateProjectRequestDTO.ProjectManagerInCharge;

            // Remove old user projects
            var oldUserProjects = _context.UserProjects.Where(up => up.ProjectId == id).ToList();
            _context.UserProjects.RemoveRange(oldUserProjects);

            // Create new user projects list
            var newUserProjects = new List<UserProject>();

            // Add updated contributors (excluding manager)
            foreach (var contributorId in updateProjectRequestDTO.Contributors)
            {
                // Skip if this contributor is the manager
                if (contributorId == updateProjectRequestDTO.ProjectManagerInCharge)
                {
                    continue;
                }

                if (!newUserProjects.Any(up => up.UserId == contributorId && up.ProjectId == id))
                {
                    newUserProjects.Add(
                        new UserProject
                        {
                            ProjectId = id,
                            UserId = contributorId,
                            ProjectRole = "Contributor",
                        }
                    );
                }
            }

            // Always add project manager as Manager
            newUserProjects.Add(
                new UserProject
                {
                    ProjectId = id,
                    UserId = updateProjectRequestDTO.ProjectManagerInCharge,
                    ProjectRole = "Manager",
                }
            );

            _context.UserProjects.AddRange(newUserProjects);

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating project: {ex.Message}");
            }

            // Return DTO instead of entity to avoid circular reference
            var projectDTO = new ProjectDTO
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                Date = project.Date,
                Status = project.Status,
                PriorityLevel = project.PriorityLevel,
                ProjectManagerInCharge = project.ProjectManagerInCharge,
                Contributors = newUserProjects
                    .Where(up => up.ProjectRole == "Contributor")
                    .Select(up => up.UserId)
                    .ToList(),
            };

            return Ok(projectDTO);
        }

        [HttpDelete]
        [Route("{id:guid}")]
        public IActionResult DeleteProjectById([FromRoute] Guid id)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            // Remove associated UserProjects first (if not handled by cascade delete)
            var userProjects = _context.UserProjects.Where(up => up.ProjectId == id).ToList();
            _context.UserProjects.RemoveRange(userProjects);

            _context.Projects.Remove(project);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpGet]
        [Route("{id:guid}/is-overdue")]
        public IActionResult GetIfProjectOverdue([FromRoute] Guid id)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == id);
            if (project == null)
            {
                return NotFound();
            }
            // If the project's date is before now, it's overdue
            bool isOverdue = project.Date < DateTime.UtcNow;
            return Ok(isOverdue);
        }
    }
}
