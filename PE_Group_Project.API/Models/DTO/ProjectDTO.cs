namespace PE_Group_Project.API.Models.DTO
{
    public class ProjectDTO
    {
<<<<<<< Updated upstream
        public Guid Id { get; set; }
=======
>>>>>>> Stashed changes
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
        public required string Status { get; set; }
        public required Guid ProjectManagerInCharge { get; set; }
        public required List<Guid> Contributors { get; set; }
    }
} 