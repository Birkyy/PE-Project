using Microsoft.AspNetCore.Mvc;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController(AppDBContext dbContext) : ControllerBase
    {
        private readonly AppDBContext _context = dbContext;

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _context.Users.ToList();
            var usersDTO = new List<UserDTO>();

            foreach (var user in users)
            {
                usersDTO.Add(
                    new UserDTO
                    {
                        Username = user.Username,
                        Email = user.Email,
                        Role = user.Role,
                        Age = user.Age,
                        Gender = user.Gender,
                        Nationality = user.Nationality,
                        PhoneNumber = user.PhoneNumber
                    }
                );
            }

            return Ok(usersDTO);
        }

        [HttpGet]
        [Route("{email}")]
        public IActionResult GetUserByEmail([FromRoute] string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound();
            }

            var userDTO = new UserDTO
            {
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Age = user.Age,
                Gender = user.Gender,
                Nationality = user.Nationality,
                PhoneNumber = user.PhoneNumber
            };

            return Ok(userDTO);
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] CreateUserRequestDTO createUserRequestDTO)
        {
            if (createUserRequestDTO == null)
            {
                return BadRequest("Invalid user data.");
            }

            // Check if email already exists
            var existingUser = _context.Users.FirstOrDefault(u => u.Email == createUserRequestDTO.Email);
            if (existingUser != null)
            {
                return BadRequest("A user with this email already exists.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = createUserRequestDTO.Username,
                Email = createUserRequestDTO.Email,
                Password = createUserRequestDTO.Password,
                Role = createUserRequestDTO.Role,
                Age = createUserRequestDTO.Age,
                Gender = createUserRequestDTO.Gender,
                Nationality = createUserRequestDTO.Nationality,
                PhoneNumber = createUserRequestDTO.PhoneNumber
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetUserByEmail), new { email = user.Email }, user);
        }

        [HttpPut]
        [Route("{email}")]
        public IActionResult UpdateUser([FromRoute] string email, [FromBody] UpdateUserRequestDTO updateUserRequestDTO)
        {
            if (updateUserRequestDTO == null)
            {
                return BadRequest("Invalid user data.");
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Check if the new email already exists (only if email is being changed)
            if (updateUserRequestDTO.Email != email)
            {
                var existingUser = _context.Users.FirstOrDefault(u => u.Email == updateUserRequestDTO.Email);
                if (existingUser != null)
                {
                    return BadRequest("A user with this email already exists.");
                }
            }

            try
            {
                user.Username = updateUserRequestDTO.Username;
                user.Email = updateUserRequestDTO.Email;
                if (!string.IsNullOrEmpty(updateUserRequestDTO.Password))
                {
                    user.Password = updateUserRequestDTO.Password;
                }
                user.Role = updateUserRequestDTO.Role;
                user.Age = updateUserRequestDTO.Age;
                user.Gender = updateUserRequestDTO.Gender;
                user.Nationality = updateUserRequestDTO.Nationality;
                user.PhoneNumber = updateUserRequestDTO.PhoneNumber;

                _context.SaveChanges();

                var userDTO = new UserDTO
                {
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role,
                    Age = user.Age,
                    Gender = user.Gender,
                    Nationality = user.Nationality,
                    PhoneNumber = user.PhoneNumber
                };

                return Ok(userDTO);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to update user: {ex.Message}");
            }
        }
    }
}
