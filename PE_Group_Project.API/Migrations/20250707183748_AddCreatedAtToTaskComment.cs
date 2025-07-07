using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PE_Group_Project.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtToTaskComment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "TaskComments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "TaskCommentId",
                table: "Blobs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Blobs_TaskCommentId",
                table: "Blobs",
                column: "TaskCommentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Blobs_TaskComments_TaskCommentId",
                table: "Blobs",
                column: "TaskCommentId",
                principalTable: "TaskComments",
                principalColumn: "TaskCommentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Blobs_TaskComments_TaskCommentId",
                table: "Blobs");

            migrationBuilder.DropIndex(
                name: "IX_Blobs_TaskCommentId",
                table: "Blobs");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "TaskComments");

            migrationBuilder.DropColumn(
                name: "TaskCommentId",
                table: "Blobs");
        }
    }
}
