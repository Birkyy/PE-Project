using PE_Group_Project.API.Models.Domain;

namespace PE_Group_Project.API.Models.DTO
{
    public class UserDTO
    {
        public Guid UserId { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public string? Role { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? Nationality { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime AccountCreatedDate { get; set; }
        public DateTime LastLoginTime { get; set; }
    }
}
