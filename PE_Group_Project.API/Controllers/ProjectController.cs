using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class ProjectController(AppDBContext dbContext) : ControllerBase
    {
        private readonly AppDBContext _context = dbContext;

        [HttpGet]
        [Route("test")]
        public IActionResult Test()
        {
            Console.WriteLine("Test endpoint called");
            return Ok(new { message = "Backend is running!", timestamp = DateTime.UtcNow });
        }

        [HttpGet]
        public IActionResult GetAllProjects([FromQuery] Guid? userId = null)
        {
            List<Project> projects;

            if (userId.HasValue)
            {
                // Get user to check their role
                var user = _context.Users.FirstOrDefault(u => u.UserId == userId.Value);
                if (user == null)
                {
                    return BadRequest("User not found.");
                }

                // If user is Admin, show all projects
                if (user.Role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true)
                {
                    projects = _context.Projects.ToList();
                }
                else
                {
                    // For non-Admin users, only show projects they're involved in
                    projects = _context
                        .UserProjects.Where(up => up.UserId == userId.Value)
                        .Select(up => up.Project)
                        .ToList();
                }
            }
            else
            {
                // If no userId provided, return all projects (maintain backward compatibility)
                projects = _context.Projects.ToList();
            }

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
                        Description = project.Description,
                        Attachments = new List<ProjectAttachmentDTO>(), // Add if needed
                    }
                );
            }

            return Ok(projectsDTO);
        }

        [HttpGet]
        [Route("{id:guid}")]
        public IActionResult GetProjectById([FromRoute] Guid id, [FromQuery] Guid? userId = null)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            // If userId is provided, check access permissions
            if (userId.HasValue)
            {
                var user = _context.Users.FirstOrDefault(u => u.UserId == userId.Value);
                if (user == null)
                {
                    return BadRequest("User not found.");
                }

                // If user is not Admin, check if they're involved in this project
                if (user.Role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) != true)
                {
                    var userProject = _context.UserProjects.FirstOrDefault(up =>
                        up.UserId == userId.Value && up.ProjectId == id
                    );

                    if (userProject == null)
                    {
                        return Forbid("You don't have access to this project.");
                    }
                }
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
                Description = project.Description,
                Attachments = new List<ProjectAttachmentDTO>(), // Add if needed
            };

            return Ok(projectDTO);
        }

        [HttpGet]
        [Route("by-user/{id:guid}")]
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
                    Description = project.Description,
                    Attachments = new List<ProjectAttachmentDTO>(), // Add if needed
                })
                .ToList();

            return Ok(projectDTOs);
        }

        [HttpPost]
        public IActionResult AddProject(
            [FromBody] CreateProjectRequestDTO createProjectRequestDTO,
            [FromQuery] Guid? userId = null
        )
        {
            if (createProjectRequestDTO == null)
            {
                return BadRequest("Project data is null.");
            }

            // If userId is provided, check access permissions
            if (userId.HasValue)
            {
                var user = _context.Users.FirstOrDefault(u => u.UserId == userId.Value);
                if (user == null)
                {
                    return BadRequest("User not found.");
                }

                // Check if user is Admin or if they're creating a project where they are the manager
                if (user.Role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) != true)
                {
                    if (createProjectRequestDTO.ProjectManagerInCharge != userId.Value)
                    {
                        return Forbid(
                            "Only Admin users can create projects for other users. You can only create projects where you are the manager."
                        );
                    }
                }
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
                Description = createProjectRequestDTO.Description,
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
                Description = project.Description,
                Attachments = new List<ProjectAttachmentDTO>(), // Add if needed
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
            [FromBody] UpdateProjectRequestDTO updateProjectRequestDTO,
            [FromQuery] Guid? userId = null
        )
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            // If userId is provided, check access permissions
            if (userId.HasValue)
            {
                var user = _context.Users.FirstOrDefault(u => u.UserId == userId.Value);
                if (user == null)
                {
                    return BadRequest("User not found.");
                }

                // Check if user is Admin or Project Manager
                if (user.Role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) != true)
                {
                    var userProject = _context.UserProjects.FirstOrDefault(up =>
                        up.UserId == userId.Value
                        && up.ProjectId == id
                        && up.ProjectRole == "Manager"
                    );

                    if (userProject == null)
                    {
                        return Forbid("Only Admin users or Project Managers can update projects.");
                    }
                }
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
            project.Description = updateProjectRequestDTO.Description;

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
                Description = project.Description,
                Attachments = new List<ProjectAttachmentDTO>(), // Add if needed
            };

            return Ok(projectDTO);
        }

        [HttpDelete]
        [Route("{id:guid}")]
        public IActionResult DeleteProjectById([FromRoute] Guid id, [FromQuery] Guid? userId = null)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            // If userId is provided, check access permissions
            if (userId.HasValue)
            {
                var user = _context.Users.FirstOrDefault(u => u.UserId == userId.Value);
                if (user == null)
                {
                    return BadRequest("User not found.");
                }

                // Check if user is Admin or Project Manager
                if (user.Role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) != true)
                {
                    var userProject = _context.UserProjects.FirstOrDefault(up =>
                        up.UserId == userId.Value
                        && up.ProjectId == id
                        && up.ProjectRole == "Manager"
                    );

                    if (userProject == null)
                    {
                        return Forbid("Only Admin users or Project Managers can delete projects.");
                    }
                }
            }

            // Remove associated UserProjects first (if not handled by cascade delete)
            var userProjects = _context.UserProjects.Where(up => up.ProjectId == id).ToList();
            _context.UserProjects.RemoveRange(userProjects);

            _context.Projects.Remove(project);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
