namespace PE_Group_Project.API.Models.Domain
{
    public class UserProject
    {
        public Guid UserId { get; set; }
        public Guid ProjectId { get; set; }
        public String? ProjectRole { get; set; }

        public virtual User User { get; set; } = null!;
        public virtual Project Project { get; set; } = null!;
    }
}
