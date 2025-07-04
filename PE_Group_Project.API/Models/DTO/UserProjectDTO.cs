namespace PE_Group_Project.API.Models.DTO
{
    public class UserProjectDTO
    {
        public Guid UserId { get; set; }
        public List<ProjectDTO> Projects { get; set; } = new();
    }
}
