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
                projectsDTO.Add(new ProjectDTO
                {
                    ProjectId = project.ProjectId,
                    ProjectName = project.ProjectName,
                    Date = project.Date,
                    Status = project.Status,
                    PriorityLevel = project.PriorityLevel,
                    ProjectManagerInCharge = project.ProjectManagerInCharge,
                    Contributors = project.Contributors
                });
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
                Contributors = project.Contributors
            };

            return Ok(projectDTO);
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
                ProjectId = createProjectRequestDTO.ProjectId != Guid.Empty ? createProjectRequestDTO.ProjectId : Guid.NewGuid(),
                ProjectName = createProjectRequestDTO.ProjectName,
                Date = createProjectRequestDTO.Date,
                Status = createProjectRequestDTO.Status,
                PriorityLevel = createProjectRequestDTO.PriorityLevel,
                ProjectManagerInCharge = createProjectRequestDTO.ProjectManagerInCharge,
                Contributors = createProjectRequestDTO.Contributors
            };

            _context.Projects.Add(project);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetProjectById), new { id = project.ProjectId }, project);
        }

        [HttpPut]
        [Route("{id:guid}")]
        public IActionResult UpdateProjectById([FromRoute] Guid id, [FromBody] UpdateProjectRequestDTO updateProjectRequestDTO)
        {
            var project = _context.Projects.FirstOrDefault(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            // Optionally, ensure the DTO ProjectId matches the route Id
            if (updateProjectRequestDTO.ProjectId != Guid.Empty && updateProjectRequestDTO.ProjectId != id)
            {
                return BadRequest("ProjectId in body does not match ProjectId in route.");
            }

            // Update properties
            project.ProjectName = updateProjectRequestDTO.ProjectName;
            project.Date = updateProjectRequestDTO.Date;
            project.Status = updateProjectRequestDTO.Status;
            project.PriorityLevel = updateProjectRequestDTO.PriorityLevel;
            project.ProjectManagerInCharge = updateProjectRequestDTO.ProjectManagerInCharge;
            project.Contributors = updateProjectRequestDTO.Contributors;
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
    }
}
