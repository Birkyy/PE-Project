using Microsoft.AspNetCore.Mvc;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly AppDBContext dbContext;
        private readonly IWebHostEnvironment environment;
        private readonly string uploadDirectory;

        public ProjectController(AppDBContext dbContext, IWebHostEnvironment environment)
        {
            this.dbContext = dbContext;
            this.environment = environment;
            this.uploadDirectory = Path.Combine(environment.ContentRootPath, "Uploads", "Projects");
            Directory.CreateDirectory(uploadDirectory);
        }

        [HttpGet]
        public IActionResult GetAllProjects()
        {
            var projects = dbContext.Projects.ToList();
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
                        Contributors = dbContext
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
            var project = dbContext.Projects.FirstOrDefault(p => p.ProjectId == id);

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
                Contributors = dbContext
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
            var userProjects = dbContext
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
                    Contributors = dbContext
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

            dbContext.Projects.Add(project);

            // Add UserProject entries
            foreach (var contributorId in createProjectRequestDTO.Contributors)
            {
                dbContext.UserProjects.Add(
                    new UserProject
                    {
                        ProjectId = project.ProjectId,
                        UserId = contributorId,
                        ProjectRole = "Contributor",
                    }
                );
            }

            // Add project manager too (optional)
            dbContext.UserProjects.Add(
                new UserProject
                {
                    ProjectId = project.ProjectId,
                    UserId = createProjectRequestDTO.ProjectManagerInCharge,
                    ProjectRole = "Manager",
                }
            );

            dbContext.SaveChanges();

            return CreatedAtAction(nameof(GetProjectById), new { id = project.ProjectId }, project);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        public async Task<IActionResult> UpdateProject([FromRoute] Guid id, [FromForm] UpdateProjectRequestDTO request)
        {
            var project = await dbContext.Projects
                .Include(p => p.Attachments)
                .FirstOrDefaultAsync(x => x.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }

            // Update basic project information
            project.ProjectName = request.ProjectName;
            project.Date = request.Date;
            project.Status = request.Status;
            project.PriorityLevel = request.PriorityLevel;
            project.Description = request.Description;

            // Handle file attachments to remove
            if (request.AttachmentsToRemove != null)
            {
                foreach (var attachmentId in request.AttachmentsToRemove)
                {
                    var attachment = project.Attachments.FirstOrDefault(a => a.Id == attachmentId);
                    if (attachment != null)
                    {
                        // Delete the physical file
                        var filePath = attachment.FilePath;
                        if (System.IO.File.Exists(filePath))
                        {
                            System.IO.File.Delete(filePath);
                        }

                        // Remove from database
                        project.Attachments.Remove(attachment);
                    }
                }
            }

            // Handle new file attachments
            if (request.NewAttachments != null)
            {
                foreach (var file in request.NewAttachments)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    var filePath = Path.Combine(uploadDirectory, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var attachment = new ProjectAttachment
                    {
                        Id = Guid.NewGuid(),
                        FileName = file.FileName,
                        ContentType = file.ContentType,
                        FileSize = file.Length,
                        FilePath = filePath,
                        UploadedAt = DateTime.UtcNow,
                        ProjectId = project.ProjectId
                    };

                    project.Attachments.Add(attachment);
                }
            }

            await dbContext.SaveChangesAsync();

            // Return updated project with file information
            var response = new ProjectDTO
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                Date = project.Date,
                Status = project.Status,
                PriorityLevel = project.PriorityLevel,
                ProjectManagerInCharge = project.ProjectManagerInCharge,
                Description = project.Description,
                Attachments = project.Attachments.Select(a => new ProjectAttachmentDTO
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    ContentType = a.ContentType,
                    FileSize = a.FileSize,
                    Url = $"/api/Project/attachments/{a.Id}",
                    UploadedAt = a.UploadedAt
                }).ToList()
            };

            return Ok(response);
        }

        [HttpGet("attachments/{id:Guid}")]
        public async Task<IActionResult> GetAttachment(Guid id)
        {
            var attachment = await dbContext.Set<ProjectAttachment>()
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attachment == null)
            {
                return NotFound();
            }

            if (!System.IO.File.Exists(attachment.FilePath))
            {
                return NotFound("File not found on server");
            }

            var memory = new MemoryStream();
            using (var stream = new FileStream(attachment.FilePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, attachment.ContentType, attachment.FileName);
        }

        [HttpDelete]
        [Route("{id:guid}")]
        public IActionResult DeleteProjectById([FromRoute] Guid id)
        {
            var project = dbContext.Projects.FirstOrDefault(p => p.ProjectId == id);

            if (project == null)
            {
                return NotFound();
            }
            dbContext.Projects.Remove(project);
            dbContext.SaveChanges();
            return NoContent();
        }

        [HttpGet]
        [Route("{id:guid}/is-overdue")]
        public IActionResult GetIfProjectOverdue([FromRoute] Guid id)
        {
            var project = dbContext.Projects.FirstOrDefault(p => p.ProjectId == id);
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
