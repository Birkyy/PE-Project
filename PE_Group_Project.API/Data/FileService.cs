using Azure.Storage.Blobs;
using PE_Group_Project.API.Models.DTO;

public class FileService
{
    private readonly string _storageAccount = "";
    private readonly string _key = "";
    private readonly BlobContainerClient _filesContainer;

    public FileService()
        : base()
    {
        var credential = new Azure.Storage.StorageSharedKeyCredential(_storageAccount, _key);
        var blobUri = $"https://{_storageAccount}.blob.core.windows.net";
        var blobServiceClient = new BlobServiceClient(new Uri(blobUri), credential);
        _filesContainer = blobServiceClient.GetBlobContainerClient("files");
    }

    public async Task<List<BlobDTO>> ListAsync()
    {
        List<BlobDTO> files = new List<BlobDTO>();

        await foreach (var file in _filesContainer.GetBlobsAsync())
        {
            string uri = _filesContainer.Uri.ToString();
            var name = file.Name;
            var fileUri = $"{uri}/{name}";

            files.Add(
                new BlobDTO
                {
                    Uri = fileUri,
                    Name = name,
                    ContentType = file.Properties.ContentType,
                }
            );
        }
        return files;
    }

    public async Task<BlobResponseDTO> UploadAsync(IFormFile blob)
    {
        BlobResponseDTO response = new BlobResponseDTO();
        BlobClient client = _filesContainer.GetBlobClient(blob.FileName);

        await using (Stream? data = blob.OpenReadStream())
        {
            await client.UploadAsync(data);
        }

        response.Status = $"File {blob.FileName} Uploaded Successfully.";
        response.Error = false;
        response.Blob.Uri = client.Uri.AbsoluteUri;
        response.Blob.Name = client.Name;

        return response;
    }

    public async Task<BlobDTO?> DownloadAsync(string fileName)
    {
        BlobClient file = _filesContainer.GetBlobClient(fileName);

        if (await file.ExistsAsync())
        {
            var data = await file.OpenReadAsync();
            Stream blobContent = data;

            var content = await file.DownloadContentAsync();

            string name = fileName;
            string contentType = content.Value.Details.ContentType;
        }

        return null;
    }

    public async Task<BlobResponseDTO> DeleteAsync(string fileName)
    {
        BlobClient file = _filesContainer.GetBlobClient(fileName);
        await file.DeleteAsync();
        return new BlobResponseDTO
        {
            Error = false,
            Status = $"File {fileName} Deleted Successfully.",
        };
    }

    public BlobClient GetBlobClient(string fileName)
    {
        return _filesContainer.GetBlobClient(fileName);
    }
}
