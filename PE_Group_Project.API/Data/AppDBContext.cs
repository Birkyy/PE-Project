using Microsoft.EntityFrameworkCore;
using PE_Group_Project.API.Models.Domain;

namespace PE_Group_Project.API.Data
{
    public class AppDBContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> ProjectTasks { get; set; }
    }
}
