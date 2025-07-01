namespace PE_Group_Project.API.Models.DTO
{
    public class RegisterRequestDTO
    {
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? Role { get; set; }
    }
}
