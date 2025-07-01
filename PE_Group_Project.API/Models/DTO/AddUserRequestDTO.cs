namespace PE_Group_Project.API.Models.DTO
{
    public class AddUserToProjectDto
    {
        public Guid UserId { get; set; }
        public Guid ProjectId { get; set; }
        public string? ProjectRole { get; set; }
    }
}
