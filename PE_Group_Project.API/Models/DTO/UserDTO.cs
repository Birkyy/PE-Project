namespace PE_Group_Project.API.Models.DTO
{
    public class UserDTO
    {
        public Guid UserId { get; set; }
        public required string? Username { get; set; }
        public string? Name { get; set; }
        public required string Email { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Nationality { get; set; }
        public DateTime AccountCreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? Role { get; set; }
    }
}
