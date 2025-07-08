using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PE_Group_Project.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration14 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TaskComments_ProjectTaskId",
                table: "TaskComments",
                column: "ProjectTaskId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskComments_TaskComments_ProjectTaskId",
                table: "TaskComments",
                column: "ProjectTaskId",
                principalTable: "TaskComments",
                principalColumn: "TaskCommentId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskComments_TaskComments_ProjectTaskId",
                table: "TaskComments");

            migrationBuilder.DropIndex(
                name: "IX_TaskComments_ProjectTaskId",
                table: "TaskComments");
        }
    }
}
