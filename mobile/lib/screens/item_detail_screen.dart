import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ItemDetailScreen extends StatefulWidget {
  final String itemId;

  const ItemDetailScreen({super.key, required this.itemId});

  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  Map<String, dynamic>? _item;
  bool _isLoading = true;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _fetchItem();
  }

  Future<void> _fetchItem() async {
    try {
      final item = await ApiService.getItemById(widget.itemId);
      if (!mounted) return;
      setState(() {
        _item = item;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Failed to load item';
        _isLoading = false;
      });
    }
  }

  void _showClaimDialog() {
    final _proofController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit a Claim'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Describe details only the true owner would know (color, marks, contents...).',
              style: TextStyle(fontSize: 13, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _proofController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Enter your proof of ownership...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (_proofController.text.trim().isEmpty) return;

              final result = await ApiService.submitClaim(
                widget.itemId,
                _proofController.text.trim(),
              );

              if (!mounted) return;
              Navigator.pop(context); // Close dialog

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    result['success']
                        ? 'Claim submitted! Wait for the finder to review it.'
                        : result['error'],
                  ),
                  backgroundColor: result['success'] ? Colors.green : Colors.red,
                ),
              );
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_item == null || _errorMessage.isNotEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Item Detail')),
        body: Center(
          child: Text(_errorMessage.isNotEmpty ? _errorMessage : 'Item not found'),
        ),
      );
    }

    final item = _item!;
    final isLost = item['type'] == 'lost';
    final canClaim = !isLost && item['status'] == 'open';

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Item Details'),
        backgroundColor: const Color(0xFF007BFF),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image
            if (item['image_url'] != null && item['image_url'].toString().isNotEmpty)
              Image.network(
                item['image_url'],
                height: 280,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 280,
                  color: Colors.grey[300],
                  child: const Icon(Icons.image_not_supported, size: 60, color: Colors.grey),
                ),
              )
            else
              Container(
                height: 200,
                color: Colors.grey[200],
                child: const Center(
                  child: Icon(Icons.image, size: 60, color: Colors.grey),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Type badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isLost ? Colors.red[50] : Colors.green[50],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      item['type'].toString().toUpperCase(),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: isLost ? Colors.red[700] : Colors.green[700],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Title
                  Text(
                    item['title'] ?? 'Untitled',
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF212529),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Info rows
                  _InfoRow(icon: Icons.location_on, label: 'Location', value: item['location'] ?? 'Unknown'),
                  const SizedBox(height: 12),
                  _InfoRow(icon: Icons.calendar_today, label: 'Reported', value: _formatDate(item['date_reported'])),
                  const SizedBox(height: 12),
                  _InfoRow(icon: Icons.info_outline, label: 'Status', value: item['status'] ?? 'open'),

                  const SizedBox(height: 20),
                  const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF212529))),
                  const SizedBox(height: 8),
                  Text(
                    item['description'] ?? 'No description provided.',
                    style: const TextStyle(fontSize: 15, height: 1.5, color: Color(0xFF495057)),
                  ),

                  const SizedBox(height: 30),

                  // Claim button (only for open found items)
                  if (canClaim)
                    SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: ElevatedButton.icon(
                        onPressed: _showClaimDialog,
                        icon: const Icon(Icons.handshake, color: Colors.white),
                        label: const Text(
                          'Claim This Item',
                          style: TextStyle(fontSize: 17, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF007BFF),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    )
                  else if (isLost)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.amber[50],
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.amber[200]!),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.orange),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text('This is a lost item. If you found it, please report it as found.'),
                          ),
                        ],
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.grey),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text('This item has already been claimed or resolved.'),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'Unknown';
    try {
      final dt = DateTime.parse(date.toString());
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return 'Unknown';
    }
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey[600]),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF495057))),
        Expanded(
          child: Text(value, style: const TextStyle(color: Color(0xFF495057))),
        ),
      ],
    );
  }
}