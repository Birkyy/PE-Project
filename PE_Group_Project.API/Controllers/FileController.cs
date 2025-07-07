using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FileController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly FileService _fileService;

        public FileController(AppDBContext context, FileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        [HttpGet("{taskId:guid}")]
        public async Task<IActionResult> GetBlobsByTaskId(Guid taskId)
        {
            var dbBlobs = await _context.Blobs.Where(b => b.ProjectTaskId == taskId).ToListAsync();

            var azureResults = new List<BlobDTO>();

            foreach (var dbBlob in dbBlobs)
            {
                var blobClient = _fileService.GetBlobClient(dbBlob.Name);

                if (await blobClient.ExistsAsync())
                {
                    var properties = await blobClient.GetPropertiesAsync();
                    var uri = blobClient.Uri.AbsoluteUri;

                    azureResults.Add(
                        new BlobDTO
                        {
                            Name = dbBlob.Name,
                            Uri = uri,
                            ContentType = properties.Value.ContentType,
                        }
                    );
                }
            }

            return Ok(azureResults);
        }

        [HttpPost("{taskId:guid}")]
        public async Task<IActionResult> UploadBlob(Guid taskId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty.");

            var uploadResult = await _fileService.UploadAsync(file);

            if (uploadResult == null)
                return StatusCode(500, "Error uploading file to Azure Blob Storage.");

            var blob = new Blob
            {
                BlobId = Guid.NewGuid(),
                ProjectTaskId = taskId,
                Name = uploadResult.Blob.Name,
                Url = uploadResult.Blob.Uri,
                ContentType = file.ContentType,
                Error = false,
                Status = "Uploaded",
                Content = null,
            };

            _context.Blobs.Add(blob);
            await _context.SaveChangesAsync();

            return Ok(blob);
        }

        [HttpDelete("{fileName}")]
        public async Task<IActionResult> DeleteBlob(string fileName)
        {
            var azureResult = await _fileService.DeleteAsync(fileName);

            var blob = await _context.Blobs.FirstOrDefaultAsync(b => b.Name == fileName);
            if (blob != null)
            {
                _context.Blobs.Remove(blob);
                await _context.SaveChangesAsync();
            }

            return Ok(azureResult);
        }
    }
}
