using Npgsql;

const string connectionString = "Host=localhost;Database=somonibank_clean;Username=postgres;Password=1234";
const string firstName = "Umarjon";
const string lastName = "Test";
const string email = "992979117007@sbank.local";
const string phone = "+992979117007";
const string password = "umarjon.1711";
const string address = "Dushanbe";
const string passportNumber = "A12345678";
const string role = "User";

var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

await using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync();

await using (var command = new NpgsqlCommand("""
    select "Id"
    from "Users"
    where "Email" = @email
    limit 1
    """, conn))
{
    command.Parameters.AddWithValue("email", email);

    var existingId = await command.ExecuteScalarAsync();

    if (existingId is Guid userId)
    {
        await using var update = new NpgsqlCommand("""
            update "Users"
            set "FirstName" = @firstName,
                "LastName" = @lastName,
                "PasswordHash" = @passwordHash,
                "IsActive" = true
            where "Id" = @id
            """, conn);

        update.Parameters.AddWithValue("id", userId);
        update.Parameters.AddWithValue("firstName", firstName);
        update.Parameters.AddWithValue("lastName", lastName);
        update.Parameters.AddWithValue("passwordHash", passwordHash);

        await update.ExecuteNonQueryAsync();
        Console.WriteLine($"UPDATED {userId}");
    }
    else
    {
        var newId = Guid.NewGuid();
        await using var insert = new NpgsqlCommand("""
            insert into "Users"
            ("Id", "FirstName", "LastName", "Email", "PasswordHash", "Phone", "Address", "PassportNumber", "Role", "IsActive", "CreatedAt")
            values
            (@id, @firstName, @lastName, @email, @passwordHash, @phone, @address, @passportNumber, @role, true, @createdAt)
            """, conn);

        insert.Parameters.AddWithValue("id", newId);
        insert.Parameters.AddWithValue("firstName", firstName);
        insert.Parameters.AddWithValue("lastName", lastName);
        insert.Parameters.AddWithValue("email", email);
        insert.Parameters.AddWithValue("passwordHash", passwordHash);
        insert.Parameters.AddWithValue("phone", phone);
        insert.Parameters.AddWithValue("address", address);
        insert.Parameters.AddWithValue("passportNumber", passportNumber);
        insert.Parameters.AddWithValue("role", role);
        insert.Parameters.AddWithValue("createdAt", DateTime.UtcNow);

        await insert.ExecuteNonQueryAsync();
        Console.WriteLine($"CREATED {newId}");
    }
}
