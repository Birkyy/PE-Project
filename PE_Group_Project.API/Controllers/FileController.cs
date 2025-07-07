using Microsoft.AspNetCore.Mvc;
using PE_Group_Project.API.Services;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController : ControllerBase
    {
        private readonly LocalFileStorageService _fileService;

        public FileController(LocalFileStorageService fileService)
        {
            _fileService = fileService;
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
            string projectId
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
        public async Task<IActionResult> UploadTaskFile([FromForm] IFormFile file, string taskId)
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

        [HttpGet("list/task/{taskId}")]
        public IActionResult ListTaskFiles(string taskId)
        {
            var dirPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "tasks", taskId);
            if (!Directory.Exists(dirPath))
                return Ok(new List<object>());

            var files = Directory
                .GetFiles(dirPath)
                .Select(filePath => new
                {
                    name = Path.GetFileName(filePath),
                    url = $"/api/File/download/tasks/{taskId}/{Path.GetFileName(filePath)}",
                    size = new FileInfo(filePath).Length,
                    contentType = GetContentType(filePath),
                })
                .ToList();
            return Ok(files);
        }

        [HttpGet("list/project/{projectId}")]
        public IActionResult ListProjectFiles(string projectId)
        {
            var dirPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "uploads",
                "projects",
                projectId
            );
            if (!Directory.Exists(dirPath))
                return Ok(new List<object>());

            var files = Directory
                .GetFiles(dirPath)
                .Select(filePath => new
                {
                    name = Path.GetFileName(filePath),
                    url = $"/api/File/download/projects/{projectId}/{Path.GetFileName(filePath)}",
                    size = new FileInfo(filePath).Length,
                    contentType = GetContentType(filePath),
                })
                .ToList();
            return Ok(files);
        }

        [HttpDelete("delete/task/{taskId}/{fileName}")]
        public IActionResult DeleteTaskFile(string taskId, string fileName)
        {
            fileName = Uri.UnescapeDataString(fileName); // Decode URL-encoded file names
            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "uploads",
                "tasks",
                taskId,
                fileName
            );
            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found.");

            System.IO.File.Delete(filePath);
            return Ok(new { message = "File deleted successfully." });
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
