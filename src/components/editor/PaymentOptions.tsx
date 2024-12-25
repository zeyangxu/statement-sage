import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export const PaymentOptions = () => {
  const { toast } = useToast()

  const handlePayment = async (amount: string) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "请先登录后再进行支付",
        })
        return
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkout`
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.session.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          name: "充值分析次数",
          money: amount,
          notify_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-limit`,
          return_url: `${window.location.origin}/payment`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate payment link")
      }

      const data = await response.json()
      if (data.code === 0 && data.link) {
        window.location.href = data.link
      } else {
        throw new Error("Invalid payment link response")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        variant: "destructive",
        title: "支付链接生成失败",
        description: "请稍后重试或联系客服",
      })
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-6 flex flex-col items-center space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold">¥19.90</h3>
          <p className="text-muted-foreground">单次分析</p>
        </div>
        <ul className="space-y-2 text-sm">
          <li>✓ 一次完整的文书分析</li>
          <li>✓ 详细的评分和建议</li>
          <li>✓ 专业的修改指导</li>
        </ul>
        <Button 
          className="w-full" 
          onClick={() => handlePayment("19.9")}
        >
          立即购买
        </Button>
      </Card>

      <Card className="p-6 flex flex-col items-center space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold">¥79.90</h3>
          <p className="text-muted-foreground">五次分析套餐</p>
        </div>
        <ul className="space-y-2 text-sm">
          <li>✓ 五次完整的文书分析</li>
          <li>✓ 更优惠的价格</li>
          <li>✓ 可分次使用</li>
        </ul>
        <Button 
          className="w-full" 
          onClick={() => handlePayment("79.9")}
        >
          立即购买
        </Button>
      </Card>
    </div>
  )
}