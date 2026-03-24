using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SomoniBank.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncRecentBankingCore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Cards",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Physical");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Accounts",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Accounts");
        }
    }
}
