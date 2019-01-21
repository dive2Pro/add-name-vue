<template>
  <div class="content">
    <div class="panel">
      <div class="panel-hd">
        <span class="title">查看零售单</span>
      </div>
      <div class="panel-bd">
        <div class="details-info-table">
          <table cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td class="tit">单号</td>
                <td>{{detail.MasterCode}}</td>
                <td class="tit">销售时间</td>
                <td>{{detail.OrderTime}}</td>
                <td class="tit">来源</td>
                <td>{{retailOrderMasterTerminalTypes.Types[detail.TerminalType]}}</td>
              </tr>
              <tr>
                <td class="tit">收银员</td>
                <td>{{detail.CashierUser}}</td>
                <td class="tit">主销导购</td>
                <td>{{detail.MainUser}}</td>
                <td class="tit">辅销导购</td>
                <td>{{detail.AssistUser}}</td>
              </tr>
              <tr>
                <td class="tit">会员姓名</td>
                <td>{{detail.TrueName}}</td>
                <td class="tit">会员手机</td>
                <td>{{detail.Mobile}}</td>
                <td class="tit">支付方式</td>
                <td colspan="2">
                  <span
                    v-for="(item, index) in detail.PaymentItem"
                    :key="index"
                    style="margin-right:10px;"
                  >{{item.CategoryName}}{{item.PayPrice && '：￥' + item.PayPrice}}</span>
                </td>
              </tr>
              <tr>
                <td class="tit">备注</td>
                <td class="note" colspan="5">{{detail.Note}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="checkPage-hd">
          <el-row>
            <el-col :span="12">
              <i class="icon-list"></i>
              <span class="title">货品列表</span>
            </el-col>
          </el-row>
        </div>
        <div class="panel-bd">
          <el-table
            class="sale_table"
            :data="detail.OrderItem"
            :show-summary="true"
            :summary-method="getSummaries"
            v-loading="$store.getters.tb_loading"
            element-loading-text="拼命加载中"
          >
            <el-table-column min-width="50">
              <template slot-scope="scope">
                <el-popover popper-class="big-img" placement="right" trigger="hover">
                  <div>
                    <img
                      :src="scope.row.ImageUrl ? $root.settings.DOMAIN_IMAGE + scope.row.ImageUrl.replace('{0}', '1080x0') : $root.settings.DOMAIN_IMAGE +  '/default/goods/150x150.jpg'"
                      alt
                    >
                  </div>
                  <div class="fl item-img" slot="reference">
                    <img
                      :src="scope.row.ImageUrl ? $root.settings.DOMAIN_IMAGE + scope.row.ImageUrl.replace('{0}', '50x50') : $root.settings.DOMAIN_IMAGE +  '/default/goods/50x50.jpg'"
                      alt
                    >
                  </div>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column prop="GoodsName" label="货品名称" min-width="250" show-overflow-tooltip>
              <template slot-scope="scope">
                <div class="clearfix" @click="showDetailDialog(scope.row)">
                  <div class="show2line tl" style="width:calc(100% - 40px)">
                    <div>
                      <span
                        class="init-button-text text-overflow"
                        :style="{'max-width': scope.row.ReturnState === retailOrderSellBasicReturnStates.ReturnOrder ? 'calc(100% - 70px)' : ''}"
                      >{{scope.row.StoreBarCode}}</span>
                      <span
                        class="el-tag el-tag--info-b1b1b1 el-tag--mini"
                        style="margin-left:5px;"
                        v-if="scope.row.ReturnState === retailOrderSellBasicReturnStates.ReturnOrder"
                      >已退货</span>
                      <br>
                      <span class="init-button-text text-overflow w-100">{{scope.row.GoodsName}}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="GoldType" label="成色" min-width="120" show-overflow-tooltip>
              <template slot-scope="scope">{{goldTypes.Types[scope.row.GoldType]}}</template>
            </el-table-column>
            <el-table-column prop="GoldWeight" label="金重(g)" min-width="110" show-overflow-tooltip></el-table-column>
            <el-table-column prop="GoldPrice" label="金价(元/g)" min-width="80" show-overflow-tooltip>
              <template slot-scope="scope">￥{{scope.row.GoldPrice}}</template>
            </el-table-column>
            <el-table-column prop="RetailType" label="零售方式" min-width="100" show-overflow-tooltip>
              <template slot-scope="scope">{{retailTypes.Types[scope.row.RetailType]}}</template>
            </el-table-column>
            <el-table-column prop="LabelPrice" label="标签价(元)" min-width="100" show-overflow-tooltip>
              <template slot-scope="scope">￥{{scope.row.LabelPrice}}</template>
            </el-table-column>
            <el-table-column
              prop="Discount"
              label="折扣"
              min-width="90"
              :render-header="tableHeaderTip1"
              show-overflow-tooltip
            >
              <template slot-scope="scope">{{(scope.row.Discount).toFixed(2) + '%'}}</template>
            </el-table-column>
            <el-table-column
              prop="ProductPrice "
              label="销售价"
              :render-header="tableHeaderTip2"
              min-width="100"
              show-overflow-tooltip
            >
              <template
                slot-scope="scope"
              >￥{{(scope.row.ProductPrice - scope.row.WorkPrice).toFixed(2)}}</template>
            </el-table-column>
            <el-table-column prop="WorkPrice" label="工费(元/件)" min-width="100" show-overflow-tooltip>
              <template slot-scope="scope">￥{{scope.row.WorkPrice}}</template>
            </el-table-column>
            <el-table-column
              prop="ProductPrice"
              label="应付金额"
              :render-header="tableHeaderTip3"
              min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">￥{{(scope.row.ProductPrice - 0).toFixed(2)}}</template>
            </el-table-column>
            <el-table-column prop="CouponPrice" label="卡券抵扣金额" min-width="100">
              <template slot-scope="scope">￥{{(scope.row.CouponPrice||0).toFixed(2)}}</template>
            </el-table-column>
            <el-table-column
              prop="RecyclePrice"
              label="卡券换购旧货回收金额"
              min-width="90"
              show-overflow-tooltip
            >
              <template slot-scope="scope">￥{{scope.row.RecyclePrice}}</template>
            </el-table-column>
            <el-table-column prop="CpfeePrice" label="折旧工费" min-width="90" show-overflow-tooltip>
              <template slot-scope="scope">￥{{scope.row.CpfeePrice}}</template>
            </el-table-column>
            <el-table-column
              prop="CashPrice"
              label="实付金额(元)"
              :render-header="tableHeaderTip4"
              min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">￥{{scope.row.CashPrice}}</template>
            </el-table-column>
            <el-table-column prop="CouponType" label="卡劵类型" min-width="90" show-overflow-tooltip>
              <template slot-scope="scope">
                <span
                  v-if=" scope.row.CouponType === 0 && scope.row.PayingType === expendOrderPayingTypes.Card"
                >优惠券</span>
                <span v-else>{{retailOrderSellSettleCouponTypes.Types[scope.row.CouponType]}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="CardactitId" label="卡劵编号" min-width="90" show-overflow-tooltip>
              <template slot-scope="scope">
                <span
                  v-if="scope.row.TicketType"
                >{{scope.row.TicketType === retailOrderSellSettleTicketTypes.WalletCoupon ? scope.row.CouponId :(scope.row.TicketType === retailOrderSellSettleTicketTypes.QueueReceiveGold ? scope.row.QueueId : scope.row.CardactitId) }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="参与活动" min-width="140">
              <template slot-scope="scope">
                <el-tooltip
                  placement="bottom"
                  effect="light"
                  v-if="scope.row.MarproTitle && scope.row.SellCode && scope.row.GiftType !== giftTypes.Gift"
                >
                  <div slot="content">消费单(点击复制):
                    <br>
                    {{scope.row.SellCode}}
                  </div>
                  <el-button
                    type="text"
                    class="copyBTN"
                    :data-clipboard-text="scope.row.SellCode"
                  >{{scope.row.MarproTitle}}</el-button>
                </el-tooltip>
                <span
                  v-else-if="scope.row.MarproTitle && scope.row.GiftType !== giftTypes.Gift"
                >{{scope.row.MarproTitle}}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="Score" label="赠送积分" min-width="100"></el-table-column>
            <el-table-column prop="GoldenRice" label="赠送礼金" min-width="100"></el-table-column>
          </el-table>
        </div>
        <div class="panel-bd" v-if="detail.JunkItem.length">
          <div class="panel-hd">
            <span class="title">旧货列表</span>
            <div class="title fr" v-if="detail.BackCode">
              旧货回收单:
              <span
                class="init-button-text"
                @click="$router.push({path: '/stock/junkInn/junkInnCheck', query: {id: 'none', code: detail.BackCode}})"
              >{{detail.BackCode}}</span>
            </div>
          </div>
          <el-table
            :data="detail.JunkItem"
            :show-summary="true"
            :summary-method="getSummaries2"
            v-loading="$store.getters.tb_loading"
            element-loading-text="拼命加载中"
          >
            <el-table-column prop="SourceType" label="来源" min-width="110" show-overflow-tooltip>
              <template
                slot-scope="scope"
              >{{retailOrderBackProductSourceTypes.Types[scope.row.SourceType] || '-'}}</template>
            </el-table-column>
            <el-table-column prop="SourceType" label="类型" min-width="110" show-overflow-tooltip>
              <template slot-scope="scope">{{scope.row.IsGold === YNStatus.Yes ?'素金':'非素'}}</template>
            </el-table-column>
            <el-table-column prop="JunkCode" label="旧货编号" min-width="80" show-overflow-tooltip>
              <template slot-scope="scope">
                <span
                  class="init-button-text"
                  @click="checkGold({'type':scope.row.IsGold === YNStatus.Yes ? true : false , 'id': scope.row.SequentialId,vipDetail:{ MemberId: detail.MemberId, Mobile: detail.Mobile}})"
                >{{scope.row.JunkCode}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="JunkName" label="旧货名称" min-width="100" show-overflow-tooltip></el-table-column>
            <el-table-column prop="IsOurStore" label="是否本店售出" min-width="100" show-overflow-tooltip>
              <template slot-scope="scope">{{scope.row.IsOurStore === YNStatus.Yes ?'是':'否'}}</template>
            </el-table-column>
            <el-table-column prop="StoreBarCode" label="原条码" min-width="90" show-overflow-tooltip></el-table-column>
            <el-table-column
              prop="GoldWeight"
              label="金重(g)"
              show-summary
              min-width="100"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="RecallGoldPrice"
              label="回收金价"
              min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">￥{{scope.row.RecallGoldPrice}}</template>
            </el-table-column>
            <el-table-column
              prop="RecallPrice"
              label="回收金额"
              show-summary
              min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">￥{{scope.row.RecallPrice}}</template>
            </el-table-column>
            <el-table-column prop="RecallFee" label="回收工费" show-summary min-width="100">
              <template slot-scope="scope">￥{{scope.row.RecallFee}}</template>
            </el-table-column>
            <el-table-column prop="Note" label="备注" min-width="90" show-overflow-tooltip></el-table-column>
          </el-table>
        </div>
        <div class="p10" style="border-top: 1px solid #ededed;">
          <div class="price_info_wapper clearfix">
            <div class="fl">
              <p colspan="2" style="font-size:16px;">
                实付金额：
                <span
                  style="font-size:16px; font-weight:bold; color:#ffa200;"
                >￥{{detail.CashPrice}}</span>
              </p>
              <p>
                <span colspan="1">货品实付金额：￥{{(detail.CashPrice + detail.RecallPrice).toFixed(2)}}</span>
                <span colspan="1">旧货抵扣(不含卡券换购)：￥{{detail.RecallPrice}}</span>
              </p>
            </div>
            <div class="fl payPrice" style="border-left: 1px solid #ededed;">
              <span
                v-for="(item, index) in detail.PaymentItem"
                :key="index"
              >{{item.CategoryName}}:{{item.PayPrice}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="buttons">
      <el-button @click="printDialog = true">打印</el-button>
    </div>
    <!-- 查看素金 & 非素 -->
    <goldCheck2
      v-if="checkJunkDialog"
      :checkJunkDialog="checkJunkDialog"
      :checkInfo="checkParams"
      @listenjunkCheck="listenjunkCheck"
    ></goldCheck2>
    <!-- end 查看素金 & 非素 -->
    <!-- dialog 货品详情 -->
    <good-detail
      v-if="goodDetailDialog.visible"
      :data="goodDetailDialog"
      @listenGoodDetailDialog="listenGoodDetailDialog"
    ></good-detail>
    <!-- end 货品详情-->
    <!-- dialog 货品详情2 -->
    <good-detail2
      v-if="goodDetailDialog2.visible"
      :data="goodDetailDialog2"
      @listenGoodDetailDialog="listenGoodDetailDialog2"
    ></good-detail2>
    <!-- end 货品详情2-->
    <!-- @module Dialog·打印大单 -->
    <print-order
      title="打印"
      v-if="printDialog"
      :printDialog="printDialog"
      :conditions="encodeURIComponent(JSON.stringify({OrderId: masterCode}))"
      :printingType="storeSettingPrintingTypes.StockingCloudSaleMasterOrder"
      @listenPrintDialog="printDialog = false"
    ></print-order>
    <!-- End Dialog·打印大单 -->
  </div>
</template>
<script>
</script>
<style scoped lang="scss">
</style>
