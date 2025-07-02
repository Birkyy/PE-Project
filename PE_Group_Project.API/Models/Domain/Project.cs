namespace PE_Group_Project.API.Models.Domain
{
    public class Project
    {
<<<<<<< Updated upstream
        public Guid Id { get; set; }
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
=======
<<<<<<< Updated upstream
        public Guid ProjectId { get; set; }
        public required string Name { get; set; }
        public DateTime CreatedAt { get; set; }
>>>>>>> Stashed changes
        public required string Status { get; set; }
        public required Guid ProjectManagerInCharge { get; set; }
        public required List<Guid> Contributors { get; set; }
    }
<<<<<<< Updated upstream
} 
=======
}
=======
        public Guid Id { get; set; }
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
        public required string Status { get; set; }
        public required Guid ProjectManagerInCharge { get; set; }
        public required List<Guid> Contributors { get; set; }
    }
} 
>>>>>>> Stashed changes
>>>>>>> Stashed changes
