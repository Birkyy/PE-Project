namespace PE_Group_Project.API.Models.DTO
{
    public class ProjectWithUsersDTO
    {
        public Guid ProjectId { get; set; }
        public required string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }
        public List<UserWithProjectRoleDTO> Users { get; set; } = new();
    }
}
