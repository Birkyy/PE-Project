namespace PE_Group_Project.API.Models.Domain
{
    public class User
    {
        public Guid UserId { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? Role { get; set; }

        public virtual ICollection<UserProject> UserProjects { get; set; } =
            new List<UserProject>();
    }
}
