namespace PE_Group_Project.API.Models.Domain
{
    public class Project
    {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        public Guid ProjectId { get; set; }
        public required string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }

        public virtual ICollection<UserProject> UserProjects { get; set; } =
            new List<UserProject>();
    }
}
=======
=======
>>>>>>> Stashed changes
        public Guid Id { get; set; }
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
        public required string Status { get; set; }
        public required Guid ProjectManagerInCharge { get; set; }
        public required List<Guid> Contributors { get; set; }
    }
<<<<<<< Updated upstream
} 
>>>>>>> Stashed changes
=======
} 
>>>>>>> Stashed changes
