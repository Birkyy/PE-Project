using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Services;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController : ControllerBase
    {
        private readonly LocalFileStorageService _fileService;
        private readonly AppDBContext _context;

        public FileController(LocalFileStorageService fileService, AppDBContext context)
        {
            _fileService = fileService;
            _context = context;
        }

        [HttpGet("list/task/{taskId}")]
        public async Task<IActionResult> GetTaskFiles(Guid taskId)
        {
            var files = await _context
                .Files.Where(f => f.RelatedId == taskId && f.Category == "task")
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.Url,
                    f.Size,
                    f.Type,
                    f.UploadedAt,
                })
                .ToListAsync();

            return Ok(files);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(
            [FromForm] IFormFile file,
            [FromForm] string? category = null,
            [FromForm] string? relatedId = null
        )
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Validate file size (50MB limit)
            const long maxFileSize = 50 * 1024 * 1024;
            if (file.Length > maxFileSize)
                return BadRequest(
                    $"File size exceeds the maximum limit of {maxFileSize / (1024 * 1024)}MB"
                );

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var url = await _fileService.UploadFileAsync(file, fileName);

            return Ok(
                new
                {
                    url,
                    fileName = file.FileName,
                    fileSize = file.Length,
                    contentType = file.ContentType,
                    category,
                    relatedId,
                }
            );
        }

        [HttpPost("upload/project/{projectId}")]
        public async Task<IActionResult> UploadProjectFile(
            [FromForm] IFormFile file,
            Guid projectId
        )
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            const long maxFileSize = 50 * 1024 * 1024;
            if (file.Length > maxFileSize)
                return BadRequest(
                    $"File size exceeds the maximum limit of {maxFileSize / (1024 * 1024)}MB"
                );

            var fileName =
                $"projects/{projectId}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var url = await _fileService.UploadFileAsync(file, fileName);

            // Save file record to database
            var fileRecord = new PE_Group_Project.API.Models.Domain.File
            {
                Id = Guid.NewGuid(),
                Name = file.FileName,
                Url = url,
                Size = file.Length,
                Type = file.ContentType,
                UploadedAt = DateTime.UtcNow,
                Category = "project",
                RelatedId = projectId,
            };

            _context.Files.Add(fileRecord);
            await _context.SaveChangesAsync();

            return Ok(
                new
                {
                    url,
                    fileName = file.FileName,
                    fileSize = file.Length,
                    contentType = file.ContentType,
                    category = "project",
                    relatedId = projectId,
                }
            );
        }

        [HttpPost("upload/task/{taskId}")]
        public async Task<IActionResult> UploadTaskFile([FromForm] IFormFile file, Guid taskId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            const long maxFileSize = 50 * 1024 * 1024;
            if (file.Length > maxFileSize)
                return BadRequest(
                    $"File size exceeds the maximum limit of {maxFileSize / (1024 * 1024)}MB"
                );

            var fileName = $"tasks/{taskId}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var url = await _fileService.UploadFileAsync(file, fileName);

            // Save file record to database
            var fileRecord = new PE_Group_Project.API.Models.Domain.File
            {
                Id = Guid.NewGuid(),
                Name = file.FileName,
                Url = url,
                Size = file.Length,
                Type = file.ContentType,
                UploadedAt = DateTime.UtcNow,
                Category = "task",
                RelatedId = taskId,
            };

            _context.Files.Add(fileRecord);
            await _context.SaveChangesAsync();

            return Ok(
                new
                {
                    url,
                    fileName = file.FileName,
                    fileSize = file.Length,
                    contentType = file.ContentType,
                    category = "task",
                    relatedId = taskId,
                }
            );
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "File controller is working!", timestamp = DateTime.UtcNow });
        }

        [HttpGet("download/{*fileName}")]
        public async Task<IActionResult> DownloadFile(string fileName)
        {
            try
            {
                var fileBytes = await _fileService.GetFileAsync(fileName);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType, Path.GetFileName(fileName));
            }
            catch (FileNotFoundException)
            {
                return NotFound($"File {fileName} not found");
            }
        }

        [HttpGet("list/project/{projectId}")]
        public async Task<IActionResult> ListProjectFiles(Guid projectId)
        {
            var files = await _context
                .Files.Where(f => f.RelatedId == projectId && f.Category == "project")
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.Url,
                    f.Size,
                    f.Type,
                    f.UploadedAt,
                })
                .ToListAsync();

            return Ok(files);
        }

        [HttpDelete("delete/{fileId}")]
        public async Task<IActionResult> DeleteFile(Guid fileId)
        {
            var file = await _context.Files.FindAsync(fileId);
            if (file == null)
                return NotFound("File not found.");

            try
            {
                // Extract file path from URL for deletion
                var filePath = file.Url.Replace($"{Request.Scheme}://{Request.Host}/uploads/", "");

                // Delete from storage
                await _fileService.DeleteFileAsync(filePath);

                // Delete from database
                _context.Files.Remove(file);
                await _context.SaveChangesAsync();

                return Ok(new { message = "File deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new { message = "Error deleting file.", error = ex.Message }
                );
            }
        }

        [HttpDelete("delete/task/{taskId}/{fileName}")]
        public async Task<IActionResult> DeleteTaskFile(string taskId, string fileName)
        {
            fileName = Uri.UnescapeDataString(fileName); // Decode URL-encoded file names

            // Find the file in the database
            var file = await _context.Files.FirstOrDefaultAsync(f =>
                f.RelatedId.ToString() == taskId && f.Category == "task" && f.Name == fileName
            );

            if (file == null)
                return NotFound("File not found.");

            try
            {
                // Extract file path from URL for deletion
                var filePath = file.Url.Replace($"{Request.Scheme}://{Request.Host}/uploads/", "");

                // Delete from storage
                await _fileService.DeleteFileAsync(filePath);

                // Delete from database
                _context.Files.Remove(file);
                await _context.SaveChangesAsync();

                return Ok(new { message = "File deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new { message = "Error deleting file.", error = ex.Message }
                );
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".txt" => "text/plain",
                ".csv" => "text/csv",
                ".doc" => "application/msword",
                ".docx" =>
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                _ => "application/octet-stream",
            };
        }
    }
}
