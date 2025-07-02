namespace PE_Group_Project.API.Models.Domain
{
    public class Project
    {
<<<<<<< Updated upstream
<<<<<<< HEAD
=======
        public Guid Id { get; set; }
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
=======
>>>>>>> ProjectBackend
<<<<<<< Updated upstream
        public Guid ProjectId { get; set; }
        public required string Name { get; set; }
        public DateTime CreatedAt { get; set; }
<<<<<<< HEAD
        public required string Status { get; set; }

        public virtual ICollection<UserProject> UserProjects { get; set; } =
            new List<UserProject>();
    }
}
=======
=======
>>>>>>> Stashed changes
=======
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
>>>>>>> ProjectBackend
        public Guid Id { get; set; }
        public required string ProjectName { get; set; }
        public required DateTime Date { get; set; }
        public required string Status { get; set; }
        public required Guid ProjectManagerInCharge { get; set; }
        public required List<Guid> Contributors { get; set; }
    }
<<<<<<< HEAD
<<<<<<< Updated upstream
} 
>>>>>>> Stashed changes
=======
} 
=======
} 
>>>>>>> Stashed changes
>>>>>>> ProjectBackend
>>>>>>> Stashed changes
