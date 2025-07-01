namespace PE_Group_Project.API.Models.DTO
{
    public class UserDTO
    {
        public Guid Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public string? Role { get; set; }
    }
}
