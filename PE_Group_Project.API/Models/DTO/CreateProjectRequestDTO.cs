namespace PE_Group_Project.API.Models.DTO
{
    public class CreateProjectRequestDTO
    {
        public string Name { get; set; } = string.Empty;
        public List<UserWithProjectRoleDTO> Users { get; set; } = new();
    }
}
