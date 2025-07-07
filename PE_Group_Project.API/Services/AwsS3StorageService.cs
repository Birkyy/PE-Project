using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;

namespace PE_Group_Project.API.Services
{
    public class AwsS3StorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly string _region;

        public AwsS3StorageService(IConfiguration configuration)
        {
            var accessKey = configuration["AWS:AccessKey"];
            var secretKey = configuration["AWS:SecretKey"];
            _region = configuration["AWS:Region"] ?? "us-east-1";
            _bucketName = configuration["AWS:S3BucketName"] ?? "project-files";

            _s3Client = new AmazonS3Client(
                accessKey,
                secretKey,
                Amazon.RegionEndpoint.GetBySystemName(_region)
            );
        }

        public async Task<string> UploadFileAsync(IFormFile file, string fileName)
        {
            await EnsureBucketExistsAsync();

            var uploadRequest = new TransferUtilityUploadRequest
            {
                InputStream = file.OpenReadStream(),
                Key = fileName,
                BucketName = _bucketName,
                ContentType = file.ContentType,
                CannedACL = S3CannedACL.Private,
            };

            using var transferUtility = new TransferUtility(_s3Client);
            await transferUtility.UploadAsync(uploadRequest);

            return $"https://{_bucketName}.s3.{_region}.amazonaws.com/{fileName}";
        }

        private async Task EnsureBucketExistsAsync()
        {
            try
            {
                await _s3Client.PutBucketAsync(
                    new PutBucketRequest { BucketName = _bucketName, UseClientRegion = true }
                );
            }
            catch (AmazonS3Exception ex) when (ex.ErrorCode == "BucketAlreadyOwnedByYou")
            {
                // Bucket already exists and is owned by us, which is fine
            }
        }
    }
}
