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
        public IActionResult CreateUser([FromBody] CreateUserRequestDTO createUserRequestDTO)
        {
            if (createUserRequestDTO == null)
            {
                return BadRequest("Invalid user data.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = createUserRequestDTO.Username,
                Email = createUserRequestDTO.Email,
                Password = createUserRequestDTO.Password,
                Role = createUserRequestDTO.Role,
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetUserByEmail), new { email = user.Email }, user);
        }
    }
}
