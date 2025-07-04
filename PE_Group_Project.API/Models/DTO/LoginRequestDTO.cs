using System.ComponentModel.DataAnnotations;
using PE_Group_Project.API.Models.Domain;

namespace PE_Group_Project.API.Models.DTO
{
    public class LoginRequestDTO
    {
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
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character")]
        public string Password { get; set; }

        public UserRole Role { get; set; } = UserRole.User; // Default role is User

        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? Nationality { get; set; }
        public string? PhoneNumber { get; set; }
    }
}