using System.ComponentModel.DataAnnotations;

namespace PE_Group_Project.API.Models.Domain
{
    public class User
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(100)]
        public string Password { get; set; }

        [Required]
        public UserRole Role { get; set; } = UserRole.User; // Default role is User

        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? Nationality { get; set; }
        public string? PhoneNumber { get; set; }
    }

    public enum UserRole
    {
        User,
        Admin
    }
}
