namespace PE_Group_Project.API.Models.DTO
{
    public class CreateProjectRequestDTO
    {
        public Guid Id { get; set; }
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
        public required string Status { get; set; }
        public required Guid ProjectManagerInCharge { get; set; }
        public required List<Guid> Contributors { get; set; }
    }
}
