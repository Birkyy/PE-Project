namespace PE_Group_Project.API.Models.DTO
{
    public class UserWithProjectRoleDTO
    {
        public Guid UserId { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public string? Role { get; set; }
        public string? ProjectRole { get; set; } // Role in the project
    }
}
