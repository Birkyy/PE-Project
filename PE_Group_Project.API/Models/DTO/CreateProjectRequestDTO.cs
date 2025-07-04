namespace PE_Group_Project.API.Models.DTO
{
    public class CreateProjectRequestDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public required string Priority { get; set; }
        public required string Status { get; set; }
        public List<UserWithProjectRoleDTO> Users { get; set; } = new();
    }
}
