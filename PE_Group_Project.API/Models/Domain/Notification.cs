namespace PE_Group_Project.API.Models.Domain
{
    public class Notification
    {
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }

        public required string Title { get; set; }
        public required string Message { get; set; }

        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }

        // Navigation
        public User User { get; set; } = null!;
    }
}
