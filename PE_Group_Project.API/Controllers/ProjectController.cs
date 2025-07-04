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
                            .UserProjects.Where(up => up.ProjectId == project.ProjectId)
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
                    .UserProjects.Where(up => up.ProjectId == project.ProjectId)
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
                        .UserProjects.Where(up => up.ProjectId == project.ProjectId)
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

            // Add UserProject entries
            foreach (var contributorId in createProjectRequestDTO.Contributors)
            {
                _context.UserProjects.Add(
                    new UserProject
                    {
                        ProjectId = project.ProjectId,
                        UserId = contributorId,
                        ProjectRole = "Contributor",
                    }
                );
            }

            // Add project manager too (optional)
            _context.UserProjects.Add(
                new UserProject
                {
                    ProjectId = project.ProjectId,
                    UserId = createProjectRequestDTO.ProjectManagerInCharge,
                    ProjectRole = "Manager",
                }
            );

            _context.SaveChanges();

            return CreatedAtAction(nameof(GetProjectById), new { id = project.ProjectId }, project);
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
            var oldUserProjects = _context.UserProjects.Where(up => up.ProjectId == id).ToList();
            _context.UserProjects.RemoveRange(oldUserProjects);

            // Add updated contributors
            foreach (var contributorId in updateProjectRequestDTO.Contributors)
            {
                _context.UserProjects.Add(
                    new UserProject
                    {
                        ProjectId = id,
                        UserId = contributorId,
                        ProjectRole = "Contributor",
                    }
                );
            }

            // Add project manager
            _context.UserProjects.Add(
                new UserProject
                {
                    ProjectId = id,
                    UserId = updateProjectRequestDTO.ProjectManagerInCharge,
                    ProjectRole = "Manager",
                }
            );
            _context.SaveChanges();

            return Ok(project);
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
