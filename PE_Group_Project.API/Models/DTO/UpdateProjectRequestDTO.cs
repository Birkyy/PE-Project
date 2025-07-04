namespace PE_Group_Project.API.Models.DTO
{
    public class UpdateProjectRequestDTO
    {
        public Guid ProjectId { get; set; }
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
        public required string Status { get; set; }
        public required string PriorityLevel { get; set; }
        public required Guid ProjectManagerInCharge { get; set; }
        public required List<Guid> Contributors { get; set; }
    }
} 