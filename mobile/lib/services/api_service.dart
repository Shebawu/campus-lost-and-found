import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Your live backend URL
  static const String baseUrl = 'https://campus-lost-and-found-api-y6d2.onrender.com';
  // ============ AUTH ============

  // Login and get a JWT token
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/users/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      // Save the token and user info locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('user', jsonEncode(data['user']));
      return {'success': true, 'data': data};
    } else {
      return {'success': false, 'error': data['error'] ?? 'Login failed'};
    }
  }

  // Register a new user
  static Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/users/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 201) {
      return {'success': true, 'data': data};
    } else {
      return {'success': false, 'error': data['error'] ?? 'Registration failed'};
    }
  }

  // Logout (clear stored data)
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  // Check if the user is logged in
  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') != null;
  }

  // Get the stored token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }
    // ============ ITEMS ============

    // Get all items with optional search and filters
  static Future<List<dynamic>> getItems({
    String? search,
    String? type,
    int? categoryId,
  }) async {
    // Build query parameters
    final params = <String, String>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (type != null && type.isNotEmpty) params['type'] = type;
    if (categoryId != null) params['category_id'] = categoryId.toString();

    // Build URL with query string
    final uri = Uri.parse('$baseUrl/api/items')
        .replace(queryParameters: params.isEmpty ? null : params);

    final response = await http.get(uri);

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load items');
    }
  }
    // Get a single item by ID
  static Future<Map<String, dynamic>> getItemById(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/items/$id'),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load item');
    }
  }

  // Submit a claim for a found item
  static Future<Map<String, dynamic>> submitClaim(String itemId, String proof) async {
    final token = await getToken();
    if (token == null) {
      return {'success': false, 'error': 'You must be logged in'};
    }

    final response = await http.post(
      Uri.parse('$baseUrl/api/claims'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'item_id': itemId,
        'proof_description': proof,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 201) {
      return {'success': true, 'data': data};
    } else {
      return {'success': false, 'error': data['error'] ?? 'Failed to submit claim'};
    }
  }
  // Report a new item with optional photo
  static Future<Map<String, dynamic>> reportItem({
    required String title,
    required String description,
    required String type,
    required String location,
    required int categoryId,
    String? imagePath,
  }) async {
    final token = await getToken();
    if (token == null) {
      return {'success': false, 'error': 'You must be logged in'};
    }

    final uri = Uri.parse('$baseUrl/api/items');
    final request = http.MultipartRequest('POST', uri);

    request.headers['Authorization'] = 'Bearer $token';

    request.fields['title'] = title;
    request.fields['description'] = description;
    request.fields['type'] = type;
    request.fields['location'] = location;
    request.fields['category_id'] = categoryId.toString();

    if (imagePath != null) {
      request.files.add(await http.MultipartFile.fromPath('image', imagePath));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    final data = jsonDecode(response.body);

    if (response.statusCode == 201) {
      return {'success': true, 'data': data};
    } else {
      return {'success': false, 'error': data['error'] ?? 'Failed to report item'};
    }
  }
  // Get my reported items
  static Future<List<dynamic>> getMyItems() async {
    final token = await getToken();
    if (token == null) throw Exception('Not logged in');

    final response = await http.get(
      Uri.parse('$baseUrl/api/users/me/items'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load your items');
    }
  }

  // Get my submitted claims
  static Future<List<dynamic>> getMyClaims() async {
    final token = await getToken();
    if (token == null) throw Exception('Not logged in');

    final response = await http.get(
      Uri.parse('$baseUrl/api/users/me/claims'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load your claims');
    }
  }

}
