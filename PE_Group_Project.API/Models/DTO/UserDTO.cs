using PE_Group_Project.API.Models.Domain;

namespace PE_Group_Project.API.Models.DTO
{
    public class UserDTO
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? Nationality { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
