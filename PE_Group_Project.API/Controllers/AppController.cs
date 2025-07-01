using Microsoft.AspNetCore.Mvc;
using PE_Group_Project.API.Data;
using PE_Group_Project.API.Models.Domain;
using PE_Group_Project.API.Models.DTO;

namespace PE_Group_Project.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppContoller(AppDBContext dbContext) : ControllerBase
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
    }
}
