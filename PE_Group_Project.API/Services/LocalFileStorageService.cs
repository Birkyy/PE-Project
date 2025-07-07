using Microsoft.AspNetCore.Http;

namespace PE_Group_Project.API.Services
{
    public class LocalFileStorageService
    {
        private readonly string _uploadPath;
        private readonly string _baseUrl;

        public LocalFileStorageService(IConfiguration configuration)
        {
            // Create uploads directory in the project root
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            _baseUrl = configuration["BaseUrl"] ?? "http://localhost:5022";

            // Ensure uploads directory exists
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<string> UploadFileAsync(IFormFile file, string fileName)
        {
            // Create subdirectories if needed (e.g., tasks/, projects/)
            var filePath = Path.Combine(_uploadPath, fileName);
            var directory = Path.GetDirectoryName(filePath);

            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            // Save file to local filesystem
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the URL to access the file
            return $"{_baseUrl}/uploads/{fileName}";
        }

        public async Task<byte[]> GetFileAsync(string fileName)
        {
            var filePath = Path.Combine(_uploadPath, fileName);

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"File not found: {fileName}");
            }

            return await File.ReadAllBytesAsync(filePath);
        }

        public async Task DeleteFileAsync(string fileName)
        {
            var filePath = Path.Combine(_uploadPath, fileName);

            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
            }
        }
    }
}
