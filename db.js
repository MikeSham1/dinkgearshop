// Dink Gear Shop — Supabase client
// Requires: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>

const SUPABASE_URL = 'https://tavrpbfuoqhekhhhnksk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5KQJffhXcWjPaBjhiln-5w_9xSuPiub';

const _db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const DinkDB = {

  // Save homepage email signup
  async saveEmailSignup(email) {
    const { error } = await _db.from('email_signups').insert({ email });
    if (error) {
      if (error.code === '23505') return { alreadySignedUp: true };
      throw error;
    }
    return { alreadySignedUp: false };
  },

  // Save contact form message
  async saveContactMessage(name, email, message) {
    const { error } = await _db.from('contact_messages').insert({ name, email, message });
    if (error) throw error;
  },

  // Validate a discount code — returns { discount_percent } or null
  async validateDiscount(code) {
    const { data, error } = await _db
      .from('discount_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('active', true)
      .single();
    if (error || !data) return null;
    if (data.max_uses && data.used_count >= data.max_uses) return null;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
    return data;
  },

  // Save a completed order — cart is array of { key, name, size, price, qty }
  async saveOrder(cart, customer, total, shippingAddress) {
    // Upsert customer
    await _db.from('customers').upsert(
      { email: customer.email, name: customer.name },
      { onConflict: 'email' }
    );

    // Insert order
    const { data: order, error: orderErr } = await _db
      .from('orders')
      .insert({
        customer_email:   customer.email,
        customer_name:    customer.name,
        total:            total,
        status:           'pending',
        shipping_address: shippingAddress || null
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Insert order items
    const items = cart.map(item => ({
      order_id:   order.id,
      product_id: item.key,
      name:       item.name,
      size:       item.size,
      price:      item.price,
      quantity:   item.qty
    }));

    const { error: itemsErr } = await _db.from('order_items').insert(items);
    if (itemsErr) throw itemsErr;

    return order;
  }

};
