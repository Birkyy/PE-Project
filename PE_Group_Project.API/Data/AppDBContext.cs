using Microsoft.EntityFrameworkCore;
using PE_Group_Project.API.Models.Domain;

namespace PE_Group_Project.API.Data
{
    public class AppDBContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> ProjectTasks { get; set; }
        public DbSet<UserProject> UserProjects { get; set; }
        public DbSet<TaskComment> TaskComments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Blob> Blobs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Set composite key for UserProject
            modelBuilder.Entity<UserProject>().HasKey(up => new { up.UserId, up.ProjectId });

            // Optional: Configure relationships (if needed)
            modelBuilder
                .Entity<UserProject>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserProjects)
                .HasForeignKey(up => up.UserId);

            modelBuilder
                .Entity<UserProject>()
                .HasOne(up => up.Project)
                .WithMany(p => p.Contributors)
                .HasForeignKey(up => up.ProjectId);

            modelBuilder
                .Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
                .Entity<Blob>()
                .HasOne(b => b.ProjectTask)
                .WithMany(t => t.Blobs)
                .HasForeignKey(b => b.ProjectTaskId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Blob>().Ignore(b => b.Content);
        }
    }
}
