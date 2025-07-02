using Microsoft.AspNetCore.Identity;
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
        private readonly PasswordHasher<User> _passwordHasher = new PasswordHasher<User>();

        private string HashPassword(string password)
        {
            return _passwordHasher.HashPassword(null, password);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            var result = _passwordHasher.VerifyHashedPassword(null, hashedPassword, password);
            return result == PasswordVerificationResult.Success;
        }

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
            };
            return Ok(userDTO);
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] RegisterRequestDTO registerRequestDTO)
        {
            if (registerRequestDTO == null)
            {
                return BadRequest("Invalid user data.");
            }

            // Additional validation
            if (string.IsNullOrWhiteSpace(registerRequestDTO.Password))
            {
                return BadRequest("Password cannot be empty.");
            }

            if (string.IsNullOrWhiteSpace(registerRequestDTO.Email))
            {
                return BadRequest("Email cannot be empty.");
            }

            if (string.IsNullOrWhiteSpace(registerRequestDTO.Username))
            {
                return BadRequest("Username cannot be empty.");
            }

            // Check if user already exists
            var existingUser = _context.Users.FirstOrDefault(u =>
                u.Email == registerRequestDTO.Email
            );
            if (existingUser != null)
            {
                return Conflict("User with this email already exists.");
            }

            var existingUsername = _context.Users.FirstOrDefault(u =>
                u.Username == registerRequestDTO.Username
            );
            if (existingUsername != null)
            {
                return Conflict("User with this username already exists.");
            }

            // Hash the password
            var hashedPassword = HashPassword(registerRequestDTO.Password);

            var user = new User
            {
                UserId = Guid.NewGuid(),
                Username = registerRequestDTO.Username,
                Email = registerRequestDTO.Email,
                Password = hashedPassword,
                Role = registerRequestDTO.Role,
            };

            _context.Users.Add(user);
            //_context.SaveChanges();

            // Return user DTO (without password) instead of full user object
            var userDTO = new UserDTO
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
            };

            return CreatedAtAction(nameof(GetUserByEmail), new { email = user.Email }, userDTO);
        }

        [HttpPost]
        [Route("login")]
        public IActionResult Login([FromBody] LoginRequestDTO loginRequestDTO)
        {
            if (
                loginRequestDTO == null
                || string.IsNullOrWhiteSpace(loginRequestDTO.Email)
                || string.IsNullOrWhiteSpace(loginRequestDTO.Password)
            )
            {
                return BadRequest("Email and password are required.");
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == loginRequestDTO.Email);
            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            if (!VerifyPassword(loginRequestDTO.Password, user.Password))
            {
                return Unauthorized("Invalid email or password.");
            }

            var userDTO = new UserDTO
            {
                UserId = user.UserId,
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
