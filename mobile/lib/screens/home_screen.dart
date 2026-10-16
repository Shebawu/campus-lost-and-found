import 'package:flutter/material.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
    List<dynamic> _items = [];
  bool _isLoading = true;
  final _searchController = TextEditingController();
  String _typeFilter = '';
  int? _categoryFilter;
  @override
  void initState() {
    super.initState();
    _fetchItems();
  }

      Future<void> _fetchItems() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.getItems(
        search: _searchController.text.trim(),
        type: _typeFilter,
        categoryId: _categoryFilter,
      );
      if (!mounted) return;
      setState(() {
        _items = response;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading items: $e')),
      );
    }
  }
  Future<void> _handleLogout() async {
    await ApiService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('🎓 Campus Lost & Found'),
        backgroundColor: const Color(0xFF007BFF),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            tooltip: 'My Dashboard',
            onPressed: () {
              Navigator.pushNamed(context, '/dashboard');
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchItems,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
          ),
        ],
      ),
      
      body: Column(
        children: [
          // ============ SEARCH & FILTER BAR ============
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.white,
            child: Column(
              children: [
                // Search bar
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search by title or description...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _fetchItems();
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.grey[100],
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                  onSubmitted: (_) => _fetchItems(),
                ),
                const SizedBox(height: 10),

                // Filter chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChip(
                        label: const Text('All'),
                        selected: _typeFilter.isEmpty,
                        onSelected: (_) {
                          setState(() => _typeFilter = '');
                          _fetchItems();
                        },
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('Lost'),
                        selected: _typeFilter == 'lost',
                        selectedColor: Colors.red[100],
                        onSelected: (selected) {
                          setState(() => _typeFilter = selected ? 'lost' : '');
                          _fetchItems();
                        },
                      ),
                      const SizedBox(width: 8),
                      FilterChip(
                        label: const Text('Found'),
                        selected: _typeFilter == 'found',
                        selectedColor: Colors.green[100],
                        onSelected: (selected) {
                          setState(() => _typeFilter = selected ? 'found' : '');
                          _fetchItems();
                        },
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: _categoryFilter != null
                                ? Colors.blue
                                : Colors.grey[300]!,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          color: _categoryFilter != null
                              ? Colors.blue[50]
                              : Colors.white,
                        ),
                        child: DropdownButton<int?>(
                          value: _categoryFilter,
                          hint: const Text('Category'),
                          underline: const SizedBox(),
                          icon: const Icon(Icons.arrow_drop_down),
                          items: const [
                            DropdownMenuItem(value: null, child: Text('All')),
                            DropdownMenuItem(value: 1, child: Text('Electronics')),
                            DropdownMenuItem(value: 2, child: Text('Documents')),
                            DropdownMenuItem(value: 3, child: Text('Keys')),
                            DropdownMenuItem(value: 4, child: Text('Bags')),
                            DropdownMenuItem(value: 5, child: Text('Books')),
                            DropdownMenuItem(value: 6, child: Text('Others')),
                          ],
                          onChanged: (value) {
                            setState(() => _categoryFilter = value);
                            _fetchItems();
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ============ ITEM LIST ============
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _items.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.all(20),
                          child: Text(
                            'No items match your search.\nTry different filters.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetchItems,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: _items.length,
                          itemBuilder: (context, index) {
                            final item = _items[index];
                            return _ItemCard(item: item);
                          },
                        ),
                      ),
          ),
        ],
      ),

            floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.pushNamed(context, '/report');
          _fetchItems();
        },
        backgroundColor: const Color(0xFF28A745),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'Report',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

class _ItemCard extends StatelessWidget {
  final Map<String, dynamic> item;

  const _ItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final isLost = item['type'] == 'lost';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          Navigator.pushNamed(
            context,
            '/item-detail',
            arguments: item['id'].toString(),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            if (item['image_url'] != null && item['image_url'].toString().isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: Image.network(
                  item['image_url'],
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 180,
                    color: Colors.grey[300],
                    child: const Icon(Icons.image_not_supported, size: 50, color: Colors.grey),
                  ),
                ),
              )
            else
              Container(
                height: 100,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: const Center(
                  child: Icon(Icons.image, size: 40, color: Colors.grey),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Type badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isLost ? Colors.red[50] : Colors.green[50],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      item['type'].toString().toUpperCase(),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isLost ? Colors.red[700] : Colors.green[700],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Title
                  Text(
                    item['title'] ?? 'Untitled',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF212529),
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Location
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          item['location'] ?? 'Unknown',
                          style: const TextStyle(fontSize: 14, color: Colors.grey),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Description
                  Text(
                    item['description'] ?? '',
                    style: const TextStyle(fontSize: 14, color: Color(0xFF495057)),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}