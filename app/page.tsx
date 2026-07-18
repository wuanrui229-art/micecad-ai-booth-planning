"use client";

import { useEffect, useMemo, useState } from "react";

type Booth = {
  id: string;
  number: string;
  type: "标准展位" | "光地" | "特装展位" | "功能区";
  area: number;
  status: "可售" | "预留" | "已售";
  x: number;
  y: number;
  w: number;
  h: number;
};

type Screen = "dashboard" | "brief" | "alternatives" | "editor";
type DashboardTab = "首页" | "项目" | "方案模板" | "规则库";
type PlanVersion = { id: string; title: string; detail: string; booths: Booth[] };
type RuleResult = { title: string; detail: string; status: "通过" | "提醒" | "阻断" };
type Language = "zh" | "en";
type TemplatePreset = {
  id: string;
  name: string;
  note: string;
  tone: string;
  standard: number;
  raw: number;
  custom: number;
  mainAisle: number;
  targetBooths: number;
  zones: string;
};
type RuleDefinition = {
  id: string;
  title: string;
  text: string;
  tag: string;
  meta: string;
  trigger: string;
  input: string;
  action: string;
  threshold?: number;
  unit?: string;
};

const EN: Record<string, string> = {
  "智能展位规划": "AI Booth Planning", "首页": "Home", "项目": "Projects", "方案模板": "Templates", "规则库": "Rule Library",
  "新建项目": "New Project", "专业服务": "Professional Service", "MICECAD 专业绘制": "MICECAD Professional Drafting",
  "由专业人员完成制图、编号、修改与交付。": "Professional drafting, numbering, revision and delivery by MICECAD specialists.",
  "提交绘制需求 →": "Submit request →", "课程项目空间": "Course Project Workspace", "工作台": "Workspace", "使用帮助": "Help",
  "项目中心": "Project Center", "展会规划项目": "Exhibition Planning Projects", "集中查看需求、候选方案、审核和发布状态。": "Review requirements, alternatives, approvals and publishing status in one place.",
  "全部 6": "All 6", "草稿 2": "Draft 2", "待确认 1": "To confirm 1", "评审中 2": "In review 2", "已发布 1": "Published 1", "搜索展会或展馆": "Search event or venue",
  "2026 中国国际食品展": "2026 China International Food Expo", "上海新国际博览中心 · N3馆": "Shanghai New International Expo Centre · Hall N3",
  "澳门科技创新博览会": "Macao Science and Technology Innovation Expo", "威尼斯人金光会展 · A馆": "Cotai Expo · Hall A",
  "华南智能制造展": "South China Smart Manufacturing Expo", "深圳国际会展中心 · 8号馆": "Shenzhen World Exhibition & Convention Center · Hall 8",
  "国际低碳建筑大会": "International Low-Carbon Building Conference", "国家会展中心 · 5.2馆": "National Exhibition and Convention Center · Hall 5.2",
  "方案评审中": "Plan under review", "需求确认": "Requirements confirmation", "已发布": "Published", "草稿": "Draft", "尚未导入底图": "No base plan imported",
  "3 个候选方案 · 昨天更新": "3 alternatives · Updated yesterday", "6 条规划约束 · 3 天前": "6 planning constraints · 3 days ago", "218 个展位 · 6 月 28 日": "218 booths · Jun 28",
  "从行业经验开始": "Start from Industry Experience", "模板提供初始配比和规则，所有参数都可以在确认阶段修改。": "Templates provide initial ratios and rules; every parameter can be adjusted during confirmation.",
  "搜索行业或展位类型": "Search industry or booth type", "全部": "All", "行业": "Industry", "展位类型": "Booth type", "功能区": "Service area",
  "食品与饮料展": "Food & Beverage Expo", "重点展区 + 标准/特装混合": "Priority zones + standard/custom mix", "消费电子展": "Consumer Electronics Expo",
  "品牌岛台 + 体验功能区": "Brand islands + experience areas", "工业制造展": "Industrial Manufacturing Expo", "大型设备光地 + 宽通道": "Raw space for large equipment + wide aisles",
  "医药健康展": "Healthcare Expo", "专业分区 + 会议功能区": "Professional zones + conference area", "标准 3×3 展位区": "Standard 3×3 Booth Zone",
  "适合中小参展商快速销售": "Designed for fast sales to small and medium exhibitors", "特装品牌展区": "Custom Brand Zone", "独立岛台与重点入口布局": "Independent islands and priority entrance layout",
  "使用模板 →": "Use template →", "可解释规则": "Explainable Rules", "展位规划规则库": "Booth Planning Rule Library", "AI 可以提出方案，但硬性规则由独立检查负责。": "AI proposes plans, while an independent checker enforces hard rules.",
  "新建规则": "New Rule", "启用规则": "Active rules", "强制规则": "Mandatory rules", "规则分类": "Rule categories", "待处理冲突": "Open conflicts",
  "通道净宽": "Aisle clear width", "主通道不得小于设定宽度，支路按项目规则检查。": "Main aisles must meet the configured width; secondary aisles follow project rules.",
  "消防出口净空": "Fire-exit clearance", "出口及疏散方向前方不得被任何展位占用。": "No booth may block an exit or evacuation path.", "展位编号唯一": "Unique booth numbers",
  "同一版本内不允许出现重复或缺失的展位编号。": "Duplicate or missing booth numbers are not allowed within a version.", "已售展位保护": "Sold-booth protection",
  "重新生成时保持已售展位的身份、面积和销售记录。": "Regeneration preserves sold booths, their area and sales records.", "展区类型配比": "Zone and type ratios",
  "检查实际面积占比与项目目标之间的偏差。": "Check the difference between actual area ratios and project targets.", "版本发布条件": "Version publishing conditions",
  "只有无阻断错误且经过授权审核的版本才能发布。": "Only authorized versions with no blocking errors can be published.", "几何规则": "Geometry rule", "安全规则": "Safety rule", "数据规则": "Data rule", "业务规则": "Business rule", "规划规则": "Planning rule", "流程规则": "Workflow rule", "强制": "Mandatory", "可配置": "Configurable", "查看设置 →": "View settings →",
  "MICECAD AI 工作台": "MICECAD AI Workspace", "上午好，吴安睿": "Good morning, Anrui Wu", "从底图和规划要求开始，建立一个可以检查、修改和交付的展位方案。": "Start with a venue plan and planning brief to create a booth layout that can be checked, revised and delivered.",
  "交互演示 · 示例项目": "Interactive demo · Sample project", "AI 展位规划助手": "AI Booth Planning Assistant", "今天要规划哪个展馆？": "Which venue would you like to plan today?",
  "上传主办方底图，或直接描述展位数量、通道、展区与销售要求。": "Upload the organizer’s venue plan or describe booth count, aisles, zones and sales requirements.", "上传底图": "Upload base plan", "描述展位规划需求": "Describe booth-planning requirements", "分析规划需求": "Analyze planning brief", "试试：": "Try:",
  "规划约 150 个展位，保留两条 6 米主通道": "Plan about 150 booths and keep two 6 m main aisles", "保留已售展位，重新优化剩余区域": "Preserve sold booths and optimize the remaining area",
  "规划约 150 个展位，保留两条 6 米主通道，食品机械区靠近北入口，并保护所有已售展位。": "Plan about 150 booths, keep two 6 m main aisles, place the Food Machinery Zone near the north entrance, and protect every sold booth.",
  "按食品机械、包装与配套服务划分展区": "Create zones for food machinery, packaging and services", "检查现有方案的通道和编号问题": "Check aisle and numbering issues in the current plan",
  "快速开始": "Quick Start", "选择更接近当前任务的入口。": "Choose the starting point closest to your task.", "AI 新建规划": "New AI Plan", "描述需求并生成多个候选方案": "Describe requirements and generate alternatives", "开始 →": "Start →",
  "导入底图规划": "Import Venue Plan", "上传 PDF、DXF 或图片作为规划基础": "Upload a PDF, DXF or image as the planning base", "上传 →": "Upload →", "从行业模板开始": "Start from an Industry Template",
  "复用展位配比、分区和规则设置": "Reuse booth ratios, zones and rule settings", "浏览 →": "Browse →", "检查现有方案": "Check an Existing Plan", "查看规则问题和可解释的修改建议": "Review rule issues and explainable change suggestions", "检查 →": "Check →",
  "最近项目": "Recent Projects", "继续上次的规划、审核或交付工作。": "Continue planning, review or delivery work.", "查看全部项目 →": "View all projects →",
  "返回工作台": "Back to workspace", "交互演示": "Interactive demo", "2026 中国国际食品展 · N3馆": "2026 China International Food Expo · Hall N3", "确认 AI 理解的规划条件": "Confirm the Planning Constraints Understood by AI",
  "选择一个候选方案": "Select an Alternative", "生成前先核对硬性规则、规划偏好和信息来源。": "Review hard rules, planning preferences and sources before generation.", "三个方案使用相同底图与硬性规则，仅优化目标不同。": "All three alternatives use the same base plan and hard rules; only their optimization priorities differ.",
  "底图预览 · 示例": "Base plan preview · Sample", "项目输入": "Project Input", "底图识别演示 · 12.4 MB": "Base-plan recognition demo · 12.4 MB", "替换": "Replace", "原始规划要求": "Original Planning Brief", "底图识别摘要": "Recognition Summary",
  "1 个展馆闭合边界": "1 closed venue boundary", "8 个出入口": "8 entrances/exits", "6 个固定柱位": "6 fixed columns", "1 个单位需要人工确认": "1 unit requires manual confirmation", "AI 已整理": "AI structured", "6 条候选约束": "6 Candidate Constraints",
  "“必须满足”将由规则检查独立验证，AI 不能覆盖检查结果。": "“Must satisfy” constraints are independently verified; AI cannot override the results.", "添加条件": "Add Constraint", "来源：": "Source: ", "返回修改需求": "Back to Edit Brief", "生成 3 个候选方案 →": "Generate 3 Alternatives →",
  "展馆边界与固定设施": "Venue boundary and fixed facilities", "按上传底图识别": "Recognized from uploaded plan", "目标展位数量": "Target booth count", "约 150 个": "About 150", "主通道宽度": "Main aisle width", "2 条，均不小于 6 m": "2 aisles, each at least 6 m",
  "位置、编号与面积不可改变": "Position, number and area cannot change", "展位类型配比": "Booth type ratio", "标准 45% · 光地 30% · 特装 25%": "Standard 45% · Raw space 30% · Custom 25%", "重点展区位置": "Priority zone location", "食品机械区靠近北入口": "Food Machinery Zone near north entrance", "必须满足": "Must satisfy", "优先满足": "Preferred", "用户规划要求": "User brief", "销售库存": "Sales inventory", "项目模板": "Project template",
  "硬性条件预检查完成": "Hard-rule Pre-check Complete", "底图边界、出口和已售展位均可用于生成；以下指标为交互演示数据。": "The boundary, exits and sold booths are ready for generation; the metrics below are demonstration data.", "方案": "Plan", "推荐": "Recommended", "面积优先": "Sellable Area First", "提高可售面积，通道布局更紧凑": "Increase sellable area with a tighter aisle layout", "动线均衡": "Balanced Circulation", "入口分流清楚，重点展区曝光更均衡": "Clear entry distribution and balanced visibility for priority zones", "标准展位优先": "Standard Booths First", "增加小面积单元，便于中小客户选位": "Add smaller units for small and medium exhibitors",
  "展位数量": "Booth count", "可售面积": "Sellable area", "未解决规则": "Unresolved rules", "已售展位变更": "Sold-booth changes", "查看方案细节 →": "View plan details →", "为什么推荐方案 B？": "Why is Plan B recommended?", "查看比较依据": "View comparison basis", "返回调整条件": "Back to Constraints", "进入专业工作台 →": "Open Professional Workspace →",
  "导入底图": "Import Plan", "确认要求": "Confirm Brief", "候选方案": "Alternatives", "规划修改": "Plan Revision", "专业交付": "Professional Delivery",
  "已保存": "Saved", "导出预览": "Export Preview", "提交专业绘制": "Submit for Drafting", "演示项目": "Demo Project", "版本记录": "Version History", "当前方案": "Current plan", "AI 规划助手": "AI Planning Assistant", "需求已确认": "Brief confirmed", "查看": "View",
  "方案已准备": "Plan Ready", "可执行": "Executable", "当前示例暂不支持": "Not supported by this demo", "已解析修改意图": "Parsed Change Intent", "操作": "Action", "拆分展位": "Split booths", "范围": "Area", "目标": "Target", "保护已售": "Protect sold booths", "是": "Yes", "未识别": "Not detected", "当前选区": "Current selection", "A 区北侧": "North side of Zone A",
  "对象级修改预览": "Object-level Change Preview", "尚未应用": "Not applied", "删除对象": "Objects removed", "新增对象": "Objects added", "示例面积": "Sample area", "已售展位": "Sold booths", "规则结果": "Rule results", "放弃": "Discard", "应用到方案并创建 V3": "Apply and Create V3", "运行示例修改": "Run Sample Change", "检查通道规则": "Check Aisle Rules", "查看版本记录": "View Version History", "添加图纸": "Attach Drawing",
  "选择": "Select", "平移": "Pan", "框选": "Box select", "适应画布": "Fit to Canvas", "图层": "Layers", "属性面板": "Properties", "北入口 · NORTH": "NORTH ENTRANCE", "6m 主通道": "6 m MAIN AISLE", "4m 横向通道": "4 m CROSS AISLE", "西入口": "WEST ENTRANCE", "东入口": "EAST ENTRANCE", "标准展位": "Standard booth", "光地": "Raw space", "特装展位": "Custom booth", "新增": "New", "可售": "Available", "预留": "Reserved", "已售": "Sold", "当前版本": "Current version", "展位": "Booths", "项通过": "passed", "项提醒": "warnings", "项阻断": "blocking",
  "当前选中": "Selected", "展位信息": "Booth Information", "展位面积": "Booth area", "开口方向": "Open sides", "双开口": "Two open sides", "所在展区": "Zone", "食品机械区": "Food Machinery Zone", "尺寸与位置": "Size and Position", "宽度": "Width", "深度": "Depth", "距最近主通道": "Distance to nearest main aisle", "销售设置": "Sales Settings", "允许在线选位": "Enable online booth selection", "销售人员可为客户锁定": "Sales staff can lock booths for customers", "展位价格": "Booth price", "位置建议 · 示例": "Location Suggestion · Sample", "对象来源": "Object source", "V3 AI 修改": "V3 AI change", "V2 候选方案": "V2 alternative", "主通道相邻": "Adjacent to main aisle", "删除此展位": "Delete Booth",
  "包装技术区": "Packaging Technology Zone", "配套服务区": "Supporting Services Zone", "公共服务区": "Public Service Zone", "消防控制": "Fire Control", "主办办公室": "Organizer Office", "设备间": "Utility Room", "仓储": "Storage", "装卸通道": "Loading Access", "紧急出口": "Emergency Exit", "消防栓": "Fire Hose", "展馆净尺寸": "Hall clear dimensions", "结构柱": "Structural column", "图例": "Legend", "否": "No",
  "展馆边界包含": "Within venue boundary", "发现超出示例展馆边界的展位": "One or more booths extend beyond the sample venue boundary", "展位不重叠": "No booth overlap", "未发现展位矩形内部相交": "No booth rectangles overlap", "发现展位矩形内部相交": "Overlapping booth rectangles detected", "主通道净宽": "Main aisle clear width", "两条主通道均保持为 6.0 m": "Both main aisles remain 6.0 m wide", "发现重复展位编号": "Duplicate booth numbers detected", "3 个已售展位的身份、面积和位置均未改变": "The identity, area and position of all 3 sold booths remain unchanged", "至少一个已售展位发生变化": "At least one sold booth has changed", "标准展位配比": "Standard-booth ratio", "通过": "Passed", "提醒": "Warning", "阻断": "Blocked", "查看对象": "View objects", "关闭": "Close", "查看配比调整建议 →": "View ratio adjustment suggestions →",
  "对象级版本记录": "Object-level Version History", "方案 B 的修改历史": "Revision History for Plan B", "恢复版本会同时恢复展位对象、数量、面积和规则结果。": "Restoring a version also restores booth objects, counts, area and rule results.", "首次生成方案 B": "Initial generation of Plan B", "拆分 A101/A103": "Split A101/A103", "初始候选方案": "Initial alternative", "由 AI 修改预览确认后创建": "Created after confirming the AI change preview", "正在使用": "In use", "恢复此版本": "Restore this version",
  "提交 MICECAD 专业绘制": "Submit for MICECAD Professional Drafting", "把已确认的底图、约束、候选方案和修改记录整理为专业绘制任务。": "Package the confirmed base plan, constraints, selected alternative and revision history as a professional drafting task.", "当前方案与展位对象": "Current plan and booth objects", "规划要求及其来源": "Planning brief and sources", "规则检查与待确认事项": "Rule checks and open items", "版本记录和销售属性": "Version history and sales attributes", "补充说明": "Additional Notes", "确认提交演示任务 →": "Confirm Demo Submission →", "这是课程原型中的交互演示，不会实际发送外部任务。": "This is an interactive course prototype; no external task will be sent.",
  "创建展位规划项目": "Create Booth Planning Project", "输入规划需求并选择底图": "Enter a Brief and Choose a Venue Plan", "生成布局必须同时具备规划需求和空间依据。": "Layout generation requires both a planning brief and a spatial reference.", "规划需求": "Planning Brief", "空间依据": "Spatial Reference", "上传场馆底图": "Upload Venue Plan", "上传 PDF、DXF、PNG 或 JPG": "Upload PDF, DXF, PNG or JPG", "使用 N3 馆示例底图": "Use the N3 Sample Venue Plan", "课程演示底图，包含边界、出入口和固定柱位": "Course-demo plan with a boundary, entrances, exits and fixed columns", "尚未选择底图": "No venue plan selected", "已选择底图": "Venue plan selected", "请先上传或选择场馆底图": "Upload or select a venue plan first", "分析需求并确认约束 →": "Analyze Brief and Confirm Constraints →", "其他方式": "Other Options", "修改现有展位方案": "Revise an Existing Plan", "进入工作台进行对象级修改": "Open the workspace for object-level revisions", "复用展区、配比与规则设置": "Reuse zones, ratios and rule settings",
  "收起边栏": "Collapse sidebar", "展开边栏": "Expand sidebar", "返回项目列表": "Back to Projects", "配置模板 →": "Configure Template →", "主通道": "main aisle",
  "模板不是固定图纸": "A Template Is Not a Fixed Drawing", "模板是一组可编辑的起始参数，包括展位配比、目标数量、通道宽度、展区建议和默认规则。确认后，这些参数会进入项目要求，再根据真实展馆底图生成方案。": "A template is an editable starting parameter set: booth mix, target count, aisle width, zoning guidance and default rules. After confirmation, the parameters become project constraints and the plan is generated against the actual venue drawing.",
  "配置模板参数": "Configure Template Parameters", "先调整参数，再把模板应用到真实展馆底图。": "Adjust the parameters first, then apply the template to the actual venue plan.", "展位配比": "Booth Mix", "目标展位数": "Target Booth Count", "标准展位比例": "Standard Booth Ratio", "光地比例": "Raw-space Ratio", "特装比例": "Custom-booth Ratio", "建议展区": "Suggested Zones", "规则预览": "Rule Preview", "配比总和必须为 100%": "Booth ratios must total 100%", "取消": "Cancel", "应用模板并确认要求 →": "Apply Template and Confirm Brief →",
  "规则如何工作": "How the Rules Work", "规则不是 AI 提示词，而是独立检查器。它读取底图、展位对象和销售状态，在生成前预检、修改后重算，并在发布前阻止硬性错误。": "Rules are not AI prompts. An independent checker reads the venue plan, booth objects and sales state, pre-checks before generation, recalculates after revisions, and blocks hard errors before publishing.",
  "项目数据": "Project Data", "独立规则检查": "Independent Rule Check", "通过 / 提醒 / 阻断": "Pass / Warn / Block", "打开规则设置": "Open Rule Settings", "规则设置": "Rule Settings", "检查对象": "Checked Input", "触发时机": "Trigger", "处理结果": "Result", "规则阈值": "Rule Threshold", "在此项目中启用": "Enable for This Project", "保存项目设置": "Save Project Settings", "设置已保存": "Settings saved", "生成前、每次修改后、发布前": "Before generation, after every revision, and before publishing", "展馆边界、通道几何与展位对象": "Venue boundary, aisle geometry and booth objects", "不满足阈值时阻止方案发布": "Block publishing when the threshold is not met", "出口、疏散方向与展位占用": "Exits, evacuation direction and booth occupancy", "发现占用时立即阻断": "Block immediately when an exit area is occupied", "当前版本的全部展位编号": "All booth numbers in the current version", "重复或缺失编号时阻断": "Block duplicate or missing numbers", "销售库存与修改前后的展位对象": "Sales inventory and booth objects before/after revision", "已售展位变化时阻断并标记对象": "Block and identify objects when sold booths change", "展位面积与项目目标配比": "Booth area and project target ratios", "偏差超过容差时提醒": "Warn when deviation exceeds tolerance", "规则结果、审核状态与用户权限": "Rule results, approval state and user permissions", "存在阻断项时禁止发布": "Disable publishing while blocking issues remain",
  "5 个项目使用": "Used by 5 projects", "3 个项目使用": "Used by 3 projects", "每次修改后、发布前": "After every revision and before publishing", "生成后、每次修改后": "After generation and every revision", "发布前": "Before publishing",
  "食品机械、包装技术、配套服务": "Food machinery, packaging technology and supporting services", "品牌展示、互动体验、配件服务": "Brand showcase, interactive experience and accessory services", "大型设备、智能制造、技术服务": "Large equipment, smart manufacturing and technical services", "医疗器械、健康服务、会议区": "Medical devices, health services and conference area", "标准展位、咨询服务、公共设施": "Standard booths, consultation services and public facilities", "旗舰品牌、新品发布、贵宾接待": "Flagship brands, product launches and VIP reception",
  "删除展位": "Delete Booth", "删除后将立即从当前方案移除此对象，并重新计算边界、编号、配比和已售保护规则。": "The booth will be removed from the current plan and boundary, numbering, ratio and sold-booth rules will be recalculated immediately.", "确认删除": "Confirm Delete", "导出交付预览": "Export Delivery Preview", "导出内容来自当前画布与实时规则结果。": "The export is generated from the current canvas and live rule results.", "当前方案数据": "Current Plan Data", "展位对象与编号": "Booth objects and numbers", "规则检查报告": "Rule-check report", "版本与项目信息": "Version and project information", "下载 DXF 演示文件": "Download Demo DXF", "下载 CSV 数据": "Download CSV Data",
  "自定义规划条件": "Custom Planning Constraint", "请描述需要满足的条件": "Describe the condition that should be satisfied", "当前 MVP 使用内置规则": "The current MVP uses built-in rules", "暂不支持": "Not available in this MVP",
  "所有展位与功能区必须位于识别出的展馆闭合边界内。": "All booths and service areas must remain inside the recognized closed venue boundary.", "展馆闭合边界与全部展位对象": "Closed venue boundary and all booth objects", "发现越界对象时阻断并定位对象": "Block and locate objects that cross the venue boundary", "同一版本中的展位矩形不得发生内部相交。": "Booth rectangles in the same version must not intersect internally.", "当前版本的全部展位几何": "All booth geometry in the current version", "发现重叠时阻断并标记对象": "Block and mark objects when overlaps are detected", "8 个出入口前方均无展位占用": "All 8 entrance and exit clearances are free of booth occupancy", "存在阻断项，当前版本不可发布": "Blocking issues remain; the current version cannot be published", "无阻断项，当前版本可以提交审核": "No blocking issues; the current version can be submitted for approval",
};

function translate(text: string, language: Language) {
  if (language === "zh") return text;
  if (EN[text]) return EN[text];
  const patterns: Array<[RegExp, (...matches: string[]) => string]> = [
    [/^(\d+) 个展位均位于示例边界内$/, (count) => `${count} booths are within the sample boundary`],
    [/^(\d+) 个展位编号均唯一$/, (count) => `${count} booth numbers are unique`],
    [/^当前面积占比 ([\d.]+)%，比 45% 目标低 ([\d.]+)%$/, (ratio, gap) => `Current area ratio is ${ratio}%, ${gap}% below the 45% target`],
    [/^(\d+) 条条件将进入规划核心$/, (count) => `${count} constraints will enter the planning core`],
    [/^(\d+) 个标准展位$/, (count) => `${count} standard booths`],
    [/^约 (\d+) 个$/, (count) => `About ${count}`],
    [/^2 条，均不小于 ([\d.]+) m$/, (width) => `2 aisles, each at least ${width} m`],
    [/^标准 (\d+)% · 光地 (\d+)% · 特装 (\d+)%$/, (standard, raw, custom) => `Standard ${standard}% · Raw space ${raw}% · Custom ${custom}%`],
    [/^实测主通道 ([\d.]+) m，项目下限 ([\d.]+) m$/, (measured, minimum) => `Measured main aisle: ${measured} m; project minimum: ${minimum} m`],
    [/^当前面积占比 ([\d.]+)%，目标 ([\d.]+)%，偏差 ([\d.]+)%$/, (ratio, target, gap) => `Current area ratio: ${ratio}%; target: ${target}%; deviation: ${gap}%`],
    [/^使用“(.+)”参数规划约 (\d+) 个展位，主通道不小于 ([\d.]+) m；展位配比为标准 (\d+)%、光地 (\d+)%、特装 (\d+)%，建议分区：(.+)。$/, (name, count, aisle, standard, raw, custom, zones) => `Use the “${translate(name, "en")}” parameters to plan about ${count} booths with main aisles of at least ${aisle} m. Booth mix: ${standard}% standard, ${raw}% raw space and ${custom}% custom; suggested zones: ${translate(zones, "en")}.`],
  ];
  for (const [pattern, replacement] of patterns) {
    const match = text.match(pattern);
    if (match) return replacement(...match.slice(1));
  }
  return text;
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return <div className="language-toggle" role="group" aria-label="Language"><button className={language === "zh" ? "active" : ""} onClick={() => onChange("zh")}>中</button><button className={language === "en" ? "active" : ""} onClick={() => onChange("en")}>EN</button></div>;
}

const booths: Booth[] = [
  { id: "b1", number: "A101", type: "特装展位", area: 126, status: "可售", x: 7, y: 10, w: 18, h: 20 },
  { id: "b2", number: "A103", type: "光地", area: 84, status: "预留", x: 29, y: 10, w: 14, h: 20 },
  { id: "b3", number: "A105", type: "特装展位", area: 120, status: "已售", x: 49, y: 10, w: 18, h: 20 },
  { id: "b4", number: "A107", type: "光地", area: 72, status: "可售", x: 71, y: 10, w: 13, h: 20 },
  { id: "b5", number: "A109", type: "标准展位", area: 36, status: "可售", x: 88, y: 10, w: 8, h: 20 },
  { id: "b6", number: "A201", type: "标准展位", area: 54, status: "可售", x: 7, y: 41, w: 12, h: 17 },
  { id: "b7", number: "A203", type: "特装展位", area: 168, status: "可售", x: 23, y: 41, w: 22, h: 25 },
  { id: "b8", number: "A205", type: "标准展位", area: 54, status: "已售", x: 50, y: 41, w: 12, h: 17 },
  { id: "b9", number: "A207", type: "光地", area: 108, status: "可售", x: 66, y: 41, w: 18, h: 25 },
  { id: "b10", number: "A209", type: "标准展位", area: 54, status: "预留", x: 88, y: 41, w: 8, h: 25 },
  { id: "b11", number: "A301", type: "功能区", area: 72, status: "预留", x: 7, y: 75, w: 17, h: 16 },
  { id: "b12", number: "A303", type: "标准展位", area: 54, status: "可售", x: 29, y: 75, w: 14, h: 16 },
  { id: "b13", number: "A305", type: "特装展位", area: 126, status: "可售", x: 49, y: 75, w: 18, h: 16 },
  { id: "b14", number: "A307", type: "光地", area: 90, status: "已售", x: 71, y: 75, w: 13, h: 16 },
  { id: "b15", number: "A309", type: "标准展位", area: 36, status: "可售", x: 88, y: 75, w: 8, h: 16 },
];

const splitBooths: Booth[] = [
  { id: "n1", number: "A111", type: "标准展位", area: 18, status: "可售", x: 7, y: 10, w: 8, h: 9.5 },
  { id: "n2", number: "A112", type: "标准展位", area: 18, status: "可售", x: 16, y: 10, w: 8, h: 9.5 },
  { id: "n3", number: "A113", type: "标准展位", area: 18, status: "可售", x: 25, y: 10, w: 8, h: 9.5 },
  { id: "n4", number: "A114", type: "标准展位", area: 18, status: "可售", x: 34, y: 10, w: 8, h: 9.5 },
  { id: "n5", number: "A115", type: "标准展位", area: 18, status: "可售", x: 7, y: 20.5, w: 8, h: 9.5 },
  { id: "n6", number: "A116", type: "标准展位", area: 18, status: "可售", x: 16, y: 20.5, w: 8, h: 9.5 },
  { id: "n7", number: "A117", type: "标准展位", area: 18, status: "可售", x: 25, y: 20.5, w: 8, h: 9.5 },
  { id: "n8", number: "A118", type: "标准展位", area: 18, status: "可售", x: 34, y: 20.5, w: 8, h: 9.5 },
];

const modifiedBooths = [...booths.filter((booth) => !["b1", "b2"].includes(booth.id)), ...splitBooths];

function overlaps(first: Booth, second: Booth) {
  return first.x < second.x + second.w && first.x + first.w > second.x && first.y < second.y + second.h && first.y + first.h > second.y;
}

function getRuleResults(plan: Booth[], settings: Record<string, { enabled: boolean; threshold?: number }>, targetStandardRatio: number): RuleResult[] {
  const inside = plan.every((booth) => booth.x >= 0 && booth.y >= 0 && booth.x + booth.w <= 100 && booth.y + booth.h <= 100);
  const hasOverlap = plan.some((booth, index) => plan.slice(index + 1).some((other) => overlaps(booth, other)));
  const numbers = plan.map((booth) => booth.number);
  const uniqueNumbers = new Set(numbers).size === numbers.length;
  const soldPreserved = booths.filter((booth) => booth.status === "已售").every((sold) => plan.some((current) => current.id === sold.id && current.number === sold.number && current.area === sold.area && current.x === sold.x && current.y === sold.y));
  const totalArea = plan.reduce((sum, booth) => sum + booth.area, 0);
  const standardArea = plan.filter((booth) => booth.type === "标准展位").reduce((sum, booth) => sum + booth.area, 0);
  const standardRatio = totalArea ? standardArea / totalArea * 100 : 0;
  const ratioTolerance = settings.ratio?.threshold ?? 5;
  const ratioGap = Math.abs(targetStandardRatio - standardRatio);
  const measuredMainAisle = 6;
  const minimumMainAisle = settings.aisle?.threshold ?? 6;
  const results: Array<[string, RuleResult]> = [
    ["boundary", { title: "展馆边界包含", detail: inside ? `${plan.length} 个展位均位于示例边界内` : "发现超出示例展馆边界的展位", status: inside ? "通过" : "阻断" }],
    ["overlap", { title: "展位不重叠", detail: hasOverlap ? "发现展位矩形内部相交" : "未发现展位矩形内部相交", status: hasOverlap ? "阻断" : "通过" }],
    ["aisle", { title: "主通道净宽", detail: `实测主通道 6.0 m，项目下限 ${minimumMainAisle.toFixed(1)} m`, status: measuredMainAisle >= minimumMainAisle ? "通过" : "阻断" }],
    ["number", { title: "展位编号唯一", detail: uniqueNumbers ? `${numbers.length} 个展位编号均唯一` : "发现重复展位编号", status: uniqueNumbers ? "通过" : "阻断" }],
    ["sold", { title: "已售展位保护", detail: soldPreserved ? "3 个已售展位的身份、面积和位置均未改变" : "至少一个已售展位发生变化", status: soldPreserved ? "通过" : "阻断" }],
    ["ratio", { title: "标准展位配比", detail: `当前面积占比 ${standardRatio.toFixed(1)}%，目标 ${targetStandardRatio.toFixed(1)}%，偏差 ${ratioGap.toFixed(1)}%`, status: ratioGap <= ratioTolerance ? "通过" : "提醒" }],
  ];
  if (settings.exit?.enabled !== false) results.push(["exit", { title: "消防出口净空", detail: "8 个出入口前方均无展位占用", status: "通过" }]);
  const enabledResults = results.filter(([id]) => settings[id]?.enabled !== false).map(([, result]) => result);
  if (settings.publish?.enabled !== false) {
    const hasBlockingIssue = enabledResults.some((result) => result.status === "阻断");
    enabledResults.push({ title: "版本发布条件", detail: hasBlockingIssue ? "存在阻断项，当前版本不可发布" : "无阻断项，当前版本可以提交审核", status: hasBlockingIssue ? "阻断" : "通过" });
  }
  return enabledResults;
}

function parseChangeIntent(text: string) {
  const count = Number(text.match(/(\d+)\s*个/)?.[1] ?? 8);
  return {
    count,
    zone: text.includes("北") || text.includes("A 区") || text.includes("A区") ? "A 区北侧" : "当前选区",
    preserveSold: /已售|不要移动|保留/.test(text),
    supported: count === 8,
  };
}

const typeColors: Record<Booth["type"], string> = {
  标准展位: "#CDE8FF",
  光地: "#DDF5C8",
  特装展位: "#FFE2A9",
  功能区: "#E8DDFF",
};

const cadColumns = [
  [18, 34], [38, 34], [58, 34], [78, 34],
  [18, 68], [38, 68], [58, 68], [78, 68],
];

const boothDimensions: Record<number, [number, number]> = {
  18: [6, 3], 36: [6, 6], 54: [9, 6], 72: [12, 6], 84: [12, 7],
  90: [10, 9], 108: [12, 9], 120: [12, 10], 126: [14, 9], 168: [14, 12],
};

function getBoothDimensions(area: number): [number, number] {
  return boothDimensions[area] ?? [Math.round(Math.sqrt(area)), Math.round(Math.sqrt(area))];
}

function getBoothZone(booth: Booth) {
  if (booth.x < 45) return "食品机械区";
  if (booth.x < 70) return "包装技术区";
  if (booth.x < 88) return "配套服务区";
  return "公共服务区";
}

const quickPrompts = [
  "规划约 150 个展位，保留两条 6 米主通道",
  "保留已售展位，重新优化剩余区域",
  "按食品机械、包装与配套服务划分展区",
  "检查现有方案的通道和编号问题",
];

const initialConstraints = [
  { id: "boundary", title: "展馆边界与固定设施", value: "按上传底图识别", severity: "必须满足", source: "N3馆主办方底图.pdf", active: true },
  { id: "count", title: "目标展位数量", value: "约 150 个", severity: "优先满足", source: "用户规划要求", active: true },
  { id: "aisle", title: "主通道宽度", value: "2 条，均不小于 6 m", severity: "必须满足", source: "用户规划要求", active: true },
  { id: "sold", title: "已售展位保护", value: "位置、编号与面积不可改变", severity: "必须满足", source: "销售库存", active: true },
  { id: "mix", title: "展位类型配比", value: "标准 45% · 光地 30% · 特装 25%", severity: "优先满足", source: "项目模板", active: true },
  { id: "zone", title: "重点展区位置", value: "食品机械区靠近北入口", severity: "优先满足", source: "用户规划要求", active: true },
];

const variants = [
  { id: "A", name: "面积优先", note: "提高可售面积，通道布局更紧凑", booths: 154, area: 10320, issues: 1, sold: 0, tone: "amber" },
  { id: "B", name: "动线均衡", note: "入口分流清楚，重点展区曝光更均衡", booths: 150, area: 9984, issues: 0, sold: 0, tone: "blue" },
  { id: "C", name: "标准展位优先", note: "增加小面积单元，便于中小客户选位", booths: 162, area: 9720, issues: 0, sold: 0, tone: "violet" },
];

const dashboardProjects = [
  { title: "2026 中国国际食品展", hall: "上海新国际博览中心 · N3馆", status: "方案评审中", meta: "3 个候选方案 · 昨天更新", color: "blue" },
  { title: "澳门科技创新博览会", hall: "威尼斯人金光会展 · A馆", status: "需求确认", meta: "6 条规划约束 · 3 天前", color: "violet" },
  { title: "华南智能制造展", hall: "深圳国际会展中心 · 8号馆", status: "已发布", meta: "218 个展位 · 6 月 28 日", color: "green" },
];

const templatePresets: TemplatePreset[] = [
  { id: "food", name: "食品与饮料展", note: "重点展区 + 标准/特装混合", tone: "amber", standard: 45, raw: 30, custom: 25, mainAisle: 6, targetBooths: 150, zones: "食品机械、包装技术、配套服务" },
  { id: "electronics", name: "消费电子展", note: "品牌岛台 + 体验功能区", tone: "blue", standard: 35, raw: 25, custom: 40, mainAisle: 6, targetBooths: 132, zones: "品牌展示、互动体验、配件服务" },
  { id: "industry", name: "工业制造展", note: "大型设备光地 + 宽通道", tone: "green", standard: 25, raw: 50, custom: 25, mainAisle: 8, targetBooths: 96, zones: "大型设备、智能制造、技术服务" },
  { id: "health", name: "医药健康展", note: "专业分区 + 会议功能区", tone: "violet", standard: 50, raw: 20, custom: 30, mainAisle: 6, targetBooths: 144, zones: "医疗器械、健康服务、会议区" },
  { id: "standard", name: "标准 3×3 展位区", note: "适合中小参展商快速销售", tone: "blue", standard: 70, raw: 15, custom: 15, mainAisle: 5, targetBooths: 180, zones: "标准展位、咨询服务、公共设施" },
  { id: "brand", name: "特装品牌展区", note: "独立岛台与重点入口布局", tone: "amber", standard: 20, raw: 20, custom: 60, mainAisle: 7, targetBooths: 72, zones: "旗舰品牌、新品发布、贵宾接待" },
];

const ruleDefinitions: RuleDefinition[] = [
  { id: "boundary", title: "展馆边界包含", text: "所有展位与功能区必须位于识别出的展馆闭合边界内。", tag: "几何规则", meta: "强制", trigger: "生成前、每次修改后、发布前", input: "展馆闭合边界与全部展位对象", action: "发现越界对象时阻断并定位对象" },
  { id: "overlap", title: "展位不重叠", text: "同一版本中的展位矩形不得发生内部相交。", tag: "几何规则", meta: "强制", trigger: "生成后、每次修改后", input: "当前版本的全部展位几何", action: "发现重叠时阻断并标记对象" },
  { id: "aisle", title: "通道净宽", text: "主通道不得小于设定宽度，支路按项目规则检查。", tag: "几何规则", meta: "5 个项目使用", trigger: "生成前、每次修改后、发布前", input: "展馆边界、通道几何与展位对象", action: "不满足阈值时阻止方案发布", threshold: 6, unit: "m" },
  { id: "exit", title: "消防出口净空", text: "出口及疏散方向前方不得被任何展位占用。", tag: "安全规则", meta: "强制", trigger: "生成前、每次修改后、发布前", input: "出口、疏散方向与展位占用", action: "发现占用时立即阻断" },
  { id: "number", title: "展位编号唯一", text: "同一版本内不允许出现重复或缺失的展位编号。", tag: "数据规则", meta: "强制", trigger: "生成前、每次修改后、发布前", input: "当前版本的全部展位编号", action: "重复或缺失编号时阻断" },
  { id: "sold", title: "已售展位保护", text: "重新生成时保持已售展位的身份、面积和销售记录。", tag: "业务规则", meta: "3 个项目使用", trigger: "每次修改后、发布前", input: "销售库存与修改前后的展位对象", action: "已售展位变化时阻断并标记对象" },
  { id: "ratio", title: "展区类型配比", text: "检查实际面积占比与项目目标之间的偏差。", tag: "规划规则", meta: "可配置", trigger: "生成后、每次修改后", input: "展位面积与项目目标配比", action: "偏差超过容差时提醒", threshold: 5, unit: "%" },
  { id: "publish", title: "版本发布条件", text: "只有无阻断错误且经过授权审核的版本才能发布。", tag: "流程规则", meta: "强制", trigger: "发布前", input: "规则结果、审核状态与用户权限", action: "存在阻断项时禁止发布" },
];

function MiniPlan({ tone = "blue", dense = false }: { tone?: string; dense?: boolean }) {
  return (
    <div className={`mini-plan ${tone} ${dense ? "dense" : ""}`} aria-hidden="true">
      {Array.from({ length: dense ? 18 : 12 }).map((_, index) => <i key={index} />)}
      <span className="mini-aisle one" /><span className="mini-aisle two" />
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("首页");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState(dashboardProjects[0]);
  const [projectFilter, setProjectFilter] = useState("全部");
  const [projectSearch, setProjectSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState("全部");
  const [templateSearch, setTemplateSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreset | null>(null);
  const [selectedRule, setSelectedRule] = useState<RuleDefinition | null>(null);
  const [ruleSettings, setRuleSettings] = useState<Record<string, { enabled: boolean; threshold?: number }>>(() => Object.fromEntries(ruleDefinitions.map((rule) => [rule.id, { enabled: true, threshold: rule.threshold }])));
  const [targetStandardRatio, setTargetStandardRatio] = useState(45);
  const [sourceFile, setSourceFile] = useState("");
  const [brief, setBrief] = useState("规划约 150 个展位，保留两条 6 米主通道，食品机械区靠近北入口，并保护所有已售展位。");
  const [constraints, setConstraints] = useState(initialConstraints);
  const [selectedVariant, setSelectedVariant] = useState("B");
  const [selectedId, setSelectedId] = useState("b7");
  const [activeType, setActiveType] = useState<"全部" | Booth["type"]>("全部");
  const [generated, setGenerated] = useState(false);
  const [canvasTool, setCanvasTool] = useState<"select" | "pan" | "box">("select");
  const [canvasZoom, setCanvasZoom] = useState(78);
  const [inspectorVisible, setInspectorVisible] = useState(true);
  const [editPrompt, setEditPrompt] = useState("将北侧 A101 和 A103 拆分为 8 个标准展位，但不要移动已售展位");
  const [messageSent, setMessageSent] = useState(false);
  const [planBooths, setPlanBooths] = useState<Booth[]>(booths);
  const [currentVersionId, setCurrentVersionId] = useState("V2");
  const [versions, setVersions] = useState<PlanVersion[]>([{ id: "V2", title: "首次生成方案 B", detail: "15 个示例展位 · 规则预检查", booths }]);
  const selected = planBooths.find((booth) => booth.id === selectedId) ?? planBooths[0];
  const selectedDimensions = getBoothDimensions(selected.area);
  const selectedZone = getBoothZone(selected);
  const selectedAisleDistance = Math.max(2, Math.min(Math.abs(selected.x - 45), Math.abs(selected.x - 84)) * 0.55).toFixed(1);
  const selectedAisleAdjacent = Number(selectedAisleDistance) <= 6;
  const changeIntent = useMemo(() => parseChangeIntent(editPrompt), [editPrompt]);
  const ruleResults = useMemo(() => getRuleResults(planBooths, ruleSettings, targetStandardRatio), [planBooths, ruleSettings, targetStandardRatio]);
  const ruleCounts = useMemo(() => ({
    passed: ruleResults.filter((rule) => rule.status === "通过").length,
    warned: ruleResults.filter((rule) => rule.status === "提醒").length,
    blocked: ruleResults.filter((rule) => rule.status === "阻断").length,
  }), [ruleResults]);
  const stats = useMemo(() => ({
    totalArea: planBooths.reduce((sum, booth) => sum + booth.area, 0),
    available: planBooths.filter((booth) => booth.status === "可售").length,
  }), [planBooths]);
  const t = (text: string) => translate(text, language);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [language]);

  const startAnalysis = (nextBrief?: string) => {
    const requestedBrief = nextBrief ?? brief;
    if (nextBrief) setBrief(nextBrief);
    if (!requestedBrief.trim() || !sourceFile) {
      setShowCreate(true);
      return;
    }
    setShowCreate(false);
    setScreen("brief");
  };

  const applyTemplate = (preset: TemplatePreset) => {
    setConstraints((items) => items.map((item) => {
      if (item.id === "count") return { ...item, value: `约 ${preset.targetBooths} 个`, source: "项目模板", active: true };
      if (item.id === "aisle") return { ...item, value: `2 条，均不小于 ${preset.mainAisle} m`, source: "项目模板", active: true };
      if (item.id === "mix") return { ...item, value: `标准 ${preset.standard}% · 光地 ${preset.raw}% · 特装 ${preset.custom}%`, source: "项目模板", active: true };
      if (item.id === "zone") return { ...item, value: preset.zones, source: "项目模板", active: true };
      return item;
    }));
    setBrief(`使用“${preset.name}”参数规划约 ${preset.targetBooths} 个展位，主通道不小于 ${preset.mainAisle} m；展位配比为标准 ${preset.standard}%、光地 ${preset.raw}%、特装 ${preset.custom}%，建议分区：${preset.zones}。`);
    setRuleSettings((settings) => ({ ...settings, aisle: { ...settings.aisle, enabled: true, threshold: preset.mainAisle } }));
    setTargetStandardRatio(preset.standard);
    setSelectedTemplate(null);
    if (sourceFile) setScreen("brief");
    else {
      setDashboardTab("首页");
      setShowCreate(true);
    }
  };

  const openProject = (project: typeof dashboardProjects[number]) => {
    setSelectedProject(project);
    setScreen("editor");
  };

  const pickFile = (file?: File, continueToBrief = true) => {
    if (!file) return;
    setSourceFile(file.name);
    if (!continueToBrief) return;
    setShowCreate(false);
    setScreen("brief");
  };

  const toggleConstraint = (id: string) => {
    setConstraints((items) => items.map((item) => item.id === id ? { ...item, active: !item.active } : item));
  };

  const addConstraint = () => {
    setConstraints((items) => [...items, { id: `custom-${Date.now()}`, title: "自定义规划条件", value: "请描述需要满足的条件", severity: "优先满足", source: "用户规划要求", active: true }]);
  };

  const applyBoothSplit = () => {
    if (!changeIntent.supported) return;
    setPlanBooths(modifiedBooths);
    setSelectedId("n1");
    setGenerated(true);
    setMessageSent(false);
    setCurrentVersionId("V3");
    setVersions((items) => items.some((version) => version.id === "V3") ? items : [...items, { id: "V3", title: "拆分 A101/A103", detail: "新增 8 个标准展位 · 保留 3 个已售展位", booths: modifiedBooths }]);
  };

  const restoreVersion = (version: PlanVersion) => {
    setPlanBooths(version.booths);
    setCurrentVersionId(version.id);
    setSelectedId(version.booths[0]?.id ?? "b1");
    setGenerated(false);
    setShowHistory(false);
  };

  const deleteSelectedBooth = () => {
    const nextBooths = planBooths.filter((booth) => booth.id !== selected.id);
    setPlanBooths(nextBooths);
    setSelectedId(nextBooths[0]?.id ?? "");
    setShowDeleteConfirm(false);
  };

  const dashboardContent = () => {
    if (dashboardTab === "项目") {
      const allProjects = dashboardProjects.concat([{ title: "国际低碳建筑大会", hall: "国家会展中心 · 5.2馆", status: "草稿", meta: "尚未导入底图", color: "amber" }]);
      const visibleProjects = allProjects.filter((project) => {
        const statusMatch = projectFilter === "全部" || (projectFilter === "草稿" && project.status === "草稿") || (projectFilter === "待确认" && project.status === "需求确认") || (projectFilter === "评审中" && project.status === "方案评审中") || (projectFilter === "已发布" && project.status === "已发布");
        const searchMatch = !projectSearch || `${project.title}${project.hall}`.toLowerCase().includes(projectSearch.toLowerCase());
        return statusMatch && searchMatch;
      });
      return (
        <div className="dashboard-page">
          <div className="page-title"><div><span className="kicker">{t("项目中心")}</span><h1>{t("展会规划项目")}</h1><p>{t("集中查看需求、候选方案、审核和发布状态。")}</p></div><button className="primary" onClick={() => setShowCreate(true)}>＋ {t("新建项目")}</button></div>
          <div className="filter-row">{[["全部", language === "en" ? `All ${allProjects.length}` : `全部 ${allProjects.length}`], ["草稿", language === "en" ? "Draft 1" : "草稿 1"], ["待确认", language === "en" ? "To confirm 1" : "待确认 1"], ["评审中", language === "en" ? "In review 1" : "评审中 1"], ["已发布", language === "en" ? "Published 1" : "已发布 1"]].map(([value, label]) => <button key={value} className={projectFilter === value ? "active" : ""} onClick={() => setProjectFilter(value)}>{label}</button>)}<label>⌕ <input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder={t("搜索展会或展馆")} /></label></div>
          <div className="project-list">
            {visibleProjects.map((project) => (
              <button className="project-row" key={project.title} onClick={() => openProject(project)}>
                <MiniPlan tone={project.color} /><span className="project-main"><b>{t(project.title)}</b><small>{t(project.hall)}</small></span><span className={`project-status ${project.color}`}>{t(project.status)}</span><span className="project-meta">{t(project.meta)}</span><span>›</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (dashboardTab === "方案模板") {
      const visibleTemplates = templatePresets.filter((template, index) => {
        const categoryMatch = templateFilter === "全部" || (templateFilter === "行业" && index < 4) || (templateFilter === "展位类型" && ["standard", "brand"].includes(template.id)) || (templateFilter === "功能区" && ["electronics", "health"].includes(template.id));
        const searchMatch = !templateSearch || `${template.name}${template.note}`.toLowerCase().includes(templateSearch.toLowerCase());
        return categoryMatch && searchMatch;
      });
      return (
        <div className="dashboard-page">
          <div className="page-title"><div><span className="kicker">{t("方案模板")}</span><h1>{t("从行业经验开始")}</h1><p>{t("模板提供初始配比和规则，所有参数都可以在确认阶段修改。")}</p></div></div>
          <div className="template-explainer"><span>▦</span><div><b>{t("模板不是固定图纸")}</b><p>{t("模板是一组可编辑的起始参数，包括展位配比、目标数量、通道宽度、展区建议和默认规则。确认后，这些参数会进入项目要求，再根据真实展馆底图生成方案。")}</p></div></div>
          <div className="template-tools"><label>⌕ <input value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} placeholder={t("搜索行业或展位类型")} /></label><div>{["全部", "行业", "展位类型", "功能区"].map((filter) => <button key={filter} className={templateFilter === filter ? "active" : ""} onClick={() => setTemplateFilter(filter)}>{t(filter)}</button>)}</div></div>
          <div className="template-grid">
            {visibleTemplates.map((template, index) => <article className="template-card" key={template.id}><MiniPlan tone={template.tone} dense={index % 2 === 0} /><span className="template-tag">{language === "en" ? `Template ${String(index + 1).padStart(2, "0")}` : `模板 ${String(index + 1).padStart(2, "0")}`}</span><h3>{t(template.name)}</h3><p>{t(template.note)}</p><div className="template-metrics"><span>{template.targetBooths} {language === "en" ? "booths" : "展位"}</span><span>{template.mainAisle} m {t("主通道")}</span><span>{template.standard}/{template.raw}/{template.custom}%</span></div><button onClick={() => setSelectedTemplate(template)}>{t("配置模板 →")}</button></article>)}
          </div>
        </div>
      );
    }

    if (dashboardTab === "规则库") {
      return (
        <div className="dashboard-page">
          <div className="page-title"><div><span className="kicker">{t("可解释规则")}</span><h1>{t("展位规划规则库")}</h1><p>{t("AI 可以提出方案，但硬性规则由独立检查负责。")}</p></div><button className="secondary" disabled title={t("当前 MVP 使用内置规则")}>＋ {t("新建规则")}</button></div>
          <div className="rule-explainer"><div><span>1</span><b>{t("项目数据")}</b></div><i>→</i><div><span>2</span><b>{t("独立规则检查")}</b></div><i>→</i><div><span>3</span><b>{t("通过 / 提醒 / 阻断")}</b></div><p>{t("规则不是 AI 提示词，而是独立检查器。它读取底图、展位对象和销售状态，在生成前预检、修改后重算，并在发布前阻止硬性错误。")}</p></div>
          <div className="rule-summary"><div><b>{ruleDefinitions.filter((rule) => ruleSettings[rule.id]?.enabled !== false).length}</b><span>{t("启用规则")}</span></div><div><b>{ruleDefinitions.filter((rule) => rule.meta === "强制").length}</b><span>{t("强制规则")}</span></div><div><b>{new Set(ruleDefinitions.map((rule) => rule.tag)).size}</b><span>{t("规则分类")}</span></div><div><b>{ruleCounts.blocked}</b><span>{t("待处理冲突")}</span></div></div>
          <div className="rule-grid">{ruleDefinitions.map((rule) => <article key={rule.id}><div><span>{ruleSettings[rule.id]?.enabled ? "✓" : "—"}</span><em>{t(rule.tag)}</em></div><h3>{t(rule.title)}</h3><p>{t(rule.text)}</p><div className="rule-when"><b>{t("触发时机")}</b><span>{t(rule.trigger)}</span></div><footer><small>{t(rule.meta)}</small><button onClick={() => setSelectedRule(rule)}>{t("查看设置 →")}</button></footer></article>)}</div>
        </div>
      );
    }

    return (
      <div className="dashboard-page home-page">
        <div className="welcome"><div><span className="kicker">{t("MICECAD AI 工作台")}</span><h1>{t("上午好，吴安睿")}</h1><p>{t("从底图和规划要求开始，建立一个可以检查、修改和交付的展位方案。")}</p></div><div className="demo-badge"><i />{t("交互演示 · 示例项目")}</div></div>
        <section className="ai-hero">
          <div className="hero-copy"><span>✦ {t("AI 展位规划助手")}</span><h2>{t("今天要规划哪个展馆？")}</h2><p>{t("上传主办方底图，或直接描述展位数量、通道、展区与销售要求。")}</p></div>
          <div className="prompt-composer">
            <label className="attach" htmlFor="hero-file" title={t("上传底图")}>＋<input id="hero-file" type="file" accept=".pdf,.dxf,.png,.jpg,.jpeg" onChange={(event) => pickFile(event.target.files?.[0])} /></label>
            <textarea value={t(brief)} onChange={(event) => setBrief(event.target.value)} aria-label={t("描述展位规划需求")} />
            <button className="send" onClick={() => startAnalysis()} aria-label={t("分析规划需求")}>→</button>
          </div>
          <div className="prompt-hints"><span>{t("试试：")}</span>{quickPrompts.map((item) => <button key={item} onClick={() => setBrief(item)}>{t(item)}</button>)}</div>
        </section>
        <section className="quick-section"><div className="section-heading"><div><h2>{t("快速开始")}</h2><p>{t("选择更接近当前任务的入口。")}</p></div></div><div className="quick-grid">
          <button onClick={() => setShowCreate(true)}><span className="quick-icon violet">✦</span><b>{t("AI 新建规划")}</b><small>{t("描述需求并生成多个候选方案")}</small><em>{t("开始 →")}</em></button>
          <label htmlFor="quick-file"><span className="quick-icon green">↥</span><b>{t("导入底图规划")}</b><small>{t("上传 PDF、DXF 或图片作为规划基础")}</small><em>{t("上传 →")}</em><input id="quick-file" type="file" accept=".pdf,.dxf,.png,.jpg,.jpeg" onChange={(event) => pickFile(event.target.files?.[0])} /></label>
          <button onClick={() => { setDashboardTab("方案模板"); }}><span className="quick-icon blue">▦</span><b>{t("从行业模板开始")}</b><small>{t("复用展位配比、分区和规则设置")}</small><em>{t("浏览 →")}</em></button>
          <button onClick={() => startAnalysis("检查现有展位方案中的通道、出口、编号和库存一致性问题。") }><span className="quick-icon amber">✓</span><b>{t("检查现有方案")}</b><small>{t("查看规则问题和可解释的修改建议")}</small><em>{t("检查 →")}</em></button>
        </div></section>
        <section className="recent-section"><div className="section-heading"><div><h2>{t("最近项目")}</h2><p>{t("继续上次的规划、审核或交付工作。")}</p></div><button onClick={() => setDashboardTab("项目")}>{t("查看全部项目 →")}</button></div><div className="recent-grid">
          {dashboardProjects.map((project) => <button className="recent-card" key={project.title} onClick={() => openProject(project)}><MiniPlan tone={project.color} /><div><span className={`project-status ${project.color}`}>{t(project.status)}</span><h3>{t(project.title)}</h3><p>{t(project.hall)}</p><small>{t(project.meta)}</small></div></button>)}
        </div></section>
      </div>
    );
  };

  if (screen === "dashboard") {
    return (
      <main className={`dashboard-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <aside className="side-nav">
          <div className="side-brand"><span>M</span><div><b>MICECAD AI</b><small>{t("智能展位规划")}</small></div><button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={t(sidebarCollapsed ? "展开边栏" : "收起边栏")} title={t(sidebarCollapsed ? "展开边栏" : "收起边栏")}>{sidebarCollapsed ? "›" : "‹"}</button></div>
          <button className="new-project" onClick={() => setShowCreate(true)} title={t("新建项目")}><span>＋</span><b>{t("新建项目")}</b></button>
          <nav aria-label="Product navigation">{(["首页", "项目", "方案模板", "规则库"] as DashboardTab[]).map((item) => <button key={item} className={dashboardTab === item ? "active" : ""} onClick={() => setDashboardTab(item)} title={t(item)}><span>{item === "首页" ? "⌂" : item === "项目" ? "□" : item === "方案模板" ? "▦" : "✓"}</span><b>{t(item)}</b></button>)}</nav>
          <div className="service-card"><span>{t("专业服务")}</span><b>{t("MICECAD 专业绘制")}</b><p>{t("由专业人员完成制图、编号、修改与交付。")}</p><button onClick={() => setShowSubmit(true)}>{t("提交绘制需求 →")}</button></div>
          <div className="side-user"><span>吴</span><div><b>{language === "en" ? "Anrui Wu" : "吴安睿"}</b><small>{t("课程项目空间")}</small></div><button disabled title={t("暂不支持")}>⋯</button></div>
        </aside>
        <section className="dashboard-main"><header className="dashboard-top"><div className="crumb">{t("工作台")} <span>/</span> {t(dashboardTab)}</div><div><LanguageToggle language={language} onChange={setLanguage} /><button className="help" disabled title={t("暂不支持")}>? {t("使用帮助")}</button><button className="notification" disabled title={t("暂不支持")}>♢<i /></button><span className="avatar">吴</span></div></header>{dashboardContent()}</section>
        {showCreate && <CreateDialog language={language} brief={brief} sourceFile={sourceFile} onBriefChange={setBrief} onClose={() => setShowCreate(false)} onAnalyze={() => startAnalysis()} onImport={(file) => pickFile(file, false)} onUseSample={() => setSourceFile("N3馆主办方底图.pdf")} onTemplate={() => { setShowCreate(false); setDashboardTab("方案模板"); }} onExisting={() => { setShowCreate(false); setScreen("editor"); }} />}
        {selectedTemplate && <TemplateConfigDialog language={language} template={selectedTemplate} onClose={() => setSelectedTemplate(null)} onApply={applyTemplate} />}
        {selectedRule && <RuleSettingsDialog language={language} rule={selectedRule} settings={ruleSettings[selectedRule.id]} onClose={() => setSelectedRule(null)} onSave={(settings) => { setRuleSettings((items) => ({ ...items, [selectedRule.id]: settings })); setSelectedRule(null); }} />}
        {showSubmit && <SubmitDialog language={language} onClose={() => setShowSubmit(false)} />}
      </main>
    );
  }

  if (screen === "brief" || screen === "alternatives") {
    return (
      <main className="flow-shell">
        <header className="flow-top"><button onClick={() => setScreen("dashboard")}>← {t("返回工作台")}</button><div className="flow-brand"><span>M</span><b>MICECAD AI</b></div><div className="flow-tools"><LanguageToggle language={language} onChange={setLanguage} /><div className="demo-badge"><i />{t("交互演示")}</div></div></header>
        <div className="flow-heading"><div><span className="kicker">{t("2026 中国国际食品展 · N3馆")}</span><h1>{t(screen === "brief" ? "确认 AI 理解的规划条件" : "选择一个候选方案")}</h1><p>{t(screen === "brief" ? "生成前先核对硬性规则、规划偏好和信息来源。" : "三个方案使用相同底图与硬性规则，仅优化目标不同。")}</p></div><FlowSteps active={screen === "brief" ? 2 : 3} language={language} /></div>
        {screen === "brief" ? <section className="brief-layout">
          <aside className="source-card"><div className="source-preview"><MiniPlan tone="blue" dense /><span>{t("底图预览 · 示例")}</span></div><h2>{t("项目输入")}</h2><div className="file-line"><span>PDF</span><div><b>{language === "en" && sourceFile === "N3馆主办方底图.pdf" ? "N3_Organizer_Base_Plan.pdf" : sourceFile}</b><small>{t("底图识别演示 · 12.4 MB")}</small></div><label className="replace-file">{t("替换")}<input type="file" accept=".pdf,.dxf,.png,.jpg,.jpeg" onChange={(event) => event.target.files?.[0] && setSourceFile(event.target.files[0].name)} /></label></div><label>{t("原始规划要求")}<textarea value={t(brief)} onChange={(event) => setBrief(event.target.value)} /></label><div className="detect-list"><h3>{t("底图识别摘要")}</h3><p><span>✓</span>{t("1 个展馆闭合边界")}</p><p><span>✓</span>{t("8 个出入口")}</p><p><span>✓</span>{t("6 个固定柱位")}</p><p><span>!</span>{t("1 个单位需要人工确认")}</p></div></aside>
          <div className="constraint-panel"><div className="constraint-head"><div><span>✦ {t("AI 已整理")}</span><h2>{t("6 条候选约束")}</h2><p>{t("“必须满足”将由规则检查独立验证，AI 不能覆盖检查结果。")}</p></div><button onClick={addConstraint}>＋ {t("添加条件")}</button></div><div className="constraint-list">{constraints.map((item) => <article className={!item.active ? "disabled" : ""} key={item.id}><button className={`check ${item.active ? "on" : ""}`} onClick={() => toggleConstraint(item.id)}>{item.active ? "✓" : ""}</button><div className="constraint-copy"><div><h3>{t(item.title)}</h3><span className={item.severity === "必须满足" ? "hard" : "soft"}>{t(item.severity)}</span></div><input value={t(item.value)} onChange={(event) => setConstraints((items) => items.map((current) => current.id === item.id ? { ...current, value: event.target.value } : current))} /><small>{t("来源：")}{t(item.source)}</small></div><button className="more" disabled title={t("暂不支持")}>•••</button></article>)}</div><div className="flow-actions"><button className="secondary" onClick={() => setScreen("dashboard")}>{t("返回修改需求")}</button><div><span>{t(`${constraints.filter((item) => item.active).length} 条条件将进入规划核心`)}</span><button className="primary" onClick={() => setScreen("alternatives")}>{t("生成 3 个候选方案 →")}</button></div></div></div>
        </section> : <section className="alternative-section"><div className="alternative-notice"><span>✓</span><div><b>{t("硬性条件预检查完成")}</b><small>{t("底图边界、出口和已售展位均可用于生成；以下指标为交互演示数据。")}</small></div></div><div className="variant-grid">{variants.map((variant) => <button className={`variant-card ${selectedVariant === variant.id ? "selected" : ""}`} key={variant.id} onClick={() => setSelectedVariant(variant.id)}><div className="variant-top"><span>{t("方案")} {variant.id}</span>{variant.id === "B" && <em>{t("推荐")}</em>}<i>{selectedVariant === variant.id ? "✓" : ""}</i></div><MiniPlan tone={variant.tone} dense={variant.id === "C"} /><h2>{t(variant.name)}</h2><p>{t(variant.note)}</p><dl><div><dt>{t("展位数量")}</dt><dd>{variant.booths} {language === "en" ? "" : "个"}</dd></div><div><dt>{t("可售面积")}</dt><dd>{variant.area.toLocaleString()} ㎡</dd></div><div><dt>{t("未解决规则")}</dt><dd className={variant.issues ? "warning" : "success"}>{variant.issues} {language === "en" ? "" : "条"}</dd></div><div><dt>{t("已售展位变更")}</dt><dd>{variant.sold} {language === "en" ? "" : "个"}</dd></div></dl><span className="variant-link">{t("查看方案细节 →")}</span></button>)}</div><div className="tradeoff"><div><span>✦</span><p><b>{t("为什么推荐方案 B？")}</b> {language === "en" ? "It has no unresolved hard-rule issues, balances entrance circulation with sellable area, and does not move any sold booth." : "它没有未解决硬性规则，在入口分流和可售面积之间更均衡，并且不移动任何已售展位。"}</p></div></div><div className="flow-actions wide"><button className="secondary" onClick={() => setScreen("brief")}>← {t("返回调整条件")}</button><div><span>{language === "en" ? `Selected Plan ${selectedVariant}` : `已选择方案 ${selectedVariant}`}</span><button className="primary" onClick={() => setScreen("editor")}>{t("进入专业工作台 →")}</button></div></div></section>}
      </main>
    );
  }

  return (
    <main className="editor-shell">
      <header className="editor-topbar"><div className="editor-brand"><span>M</span><div><b>MICECAD AI</b><small>{t("智能展位规划")}</small></div></div><button className="project-switch" onClick={() => { setDashboardTab("项目"); setScreen("dashboard"); }}>← {t("返回项目列表")}</button><div className="editor-title"><span>{t(selectedProject.title)}</span><b>{t(selectedProject.hall)}</b><em>{t("演示项目")}</em></div><div className="editor-actions"><LanguageToggle language={language} onChange={setLanguage} /><span>● {t("已保存")}</span><button onClick={() => setShowExport(true)}>{t("导出预览")}</button><button className="primary" onClick={() => setShowSubmit(true)}>{t("提交专业绘制")}</button><div className="avatar">吴</div></div></header>
      <section className="editor-progress"><FlowSteps active={4} compact language={language} /><div className="plan-tabs"><button className="version-button" onClick={() => setShowHistory(true)}>↺ {currentVersionId} · {t("版本记录")}</button><span>{t("当前方案")}</span>{variants.map((variant) => <button key={variant.id} className={selectedVariant === variant.id ? "active" : ""} onClick={() => setSelectedVariant(variant.id)}>{t("方案")} {variant.id}</button>)}</div></section>
      <section className={`workspace ${inspectorVisible ? "" : "inspector-hidden"}`}>
        <aside className="assistant-panel"><div className="assistant-head"><div><span>✦</span><div><b>{t("AI 规划助手")}</b><small>{t("方案")} {selectedVariant} · {currentVersionId} · {t("需求已确认")}</small></div></div><button disabled title={t("暂不支持")}>•••</button></div><div className="context-strip"><span>{language === "en" ? `${constraints.length} constraints` : `${constraints.length} 条约束`}</span><span>{language === "en" ? `${ruleCounts.passed} rules passed` : `${ruleCounts.passed} 条规则通过`}</span><button onClick={() => setScreen("brief")}>{t("查看")}</button></div><div className="conversation"><div className="message ai"><span>AI</span><div><b>{t("方案已准备")}</b><p>{language === "en" ? `This plan uses the “${t(variants.find((item) => item.id === selectedVariant)?.name ?? "")}” objective. Send the sample revision below and I will parse the intent before showing object-level differences.` : `当前方案采用“${variants.find((item) => item.id === selectedVariant)?.name}”目标。试着发送下面的示例修改，我会先解析意图并展示对象级差异。`}</p></div></div>{messageSent && <><div className="message user"><div><p>{language === "en" ? "Split north-side booths A101 and A103 into 8 standard booths without moving sold booths." : editPrompt}</p></div></div><div className={`intent-card ${changeIntent.supported ? "" : "unsupported"}`}><header><span>{t("已解析修改意图")}</span><em>{t(changeIntent.supported ? "可执行" : "当前示例暂不支持")}</em></header><div><span>{t("操作")}<b>{t("拆分展位")}</b></span><span>{t("范围")}<b>{t(changeIntent.zone)}</b></span><span>{t("目标")}<b>{t(`${changeIntent.count} 个标准展位`)}</b></span><span>{t("保护已售")}<b>{t(changeIntent.preserveSold ? "是" : "未识别")}</b></span></div></div><div className="change-card"><header><span>✦ {t("对象级修改预览")}</span><em>{t("尚未应用")}</em></header><p>{language === "en" ? (changeIntent.supported ? "Split A101 and A103 into eight 18㎡ standard booths, numbered A111–A118." : "This runnable demo only supports splitting A101/A103 into 8 standard booths.") : (changeIntent.supported ? "拆分 A101 与 A103，生成 A111–A118 八个 18㎡标准展位。" : "当前可运行演示仅支持拆分 A101/A103 并生成 8 个标准展位。")}</p><dl><div><dt>{t("删除对象")}</dt><dd>A101, A103</dd></div><div><dt>{t("新增对象")}</dt><dd>A111–A118</dd></div><div><dt>{t("展位数量")}</dt><dd>15 → 21 (+6)</dd></div><div><dt>{t("示例面积")}</dt><dd>1,254 → 1,188㎡ (-66㎡)</dd></div><div><dt>{t("已售展位")}</dt><dd>{language === "en" ? "3 booths, 0 changed" : "3 个，0 个变更"}</dd></div><div><dt>{t("规则结果")}</dt><dd>{language === "en" ? "5 passed · 1 warning" : "5 通过 · 1 提醒"}</dd></div></dl><div><button onClick={() => setMessageSent(false)}>{t("放弃")}</button><button className="apply" disabled={!changeIntent.supported} onClick={applyBoothSplit}>{t("应用到方案并创建 V3")}</button></div></div></>}</div><div className="suggestions"><button onClick={() => setEditPrompt("将北侧 A101 和 A103 拆分为 8 个标准展位，但不要移动已售展位")}>{t("运行示例修改")}</button><button onClick={() => setShowValidation(true)}>{t("检查通道规则")}</button><button onClick={() => setShowHistory(true)}>{t("查看版本记录")}</button></div><div className="assistant-compose"><textarea value={language === "en" ? "Split north-side booths A101 and A103 into 8 standard booths without moving sold booths" : editPrompt} onChange={(event) => setEditPrompt(event.target.value)} aria-label={language === "en" ? "Enter plan revision request" : "输入方案修改要求"} /><div><label className="attach-drawing">＋ {t("添加图纸")}<input type="file" accept=".pdf,.dxf,.png,.jpg,.jpeg" /></label><button className="send" onClick={() => setMessageSent(true)}>↑</button></div></div><p className="assistant-note">{language === "en" ? "This in-depth demo supports the complete loop of splitting A101/A103 into 8 standard booths." : "当前深度演示支持“拆分 A101/A103，新增 8 个标准展位”的完整闭环。"}</p></aside>
        <section className="canvas-panel">
          <div className="canvas-toolbar"><div><button className={canvasTool === "select" ? "active" : ""} onClick={() => setCanvasTool("select")}>↖ {t("选择")}</button><button className={canvasTool === "pan" ? "active" : ""} onClick={() => setCanvasTool("pan")}>✋ {t("平移")}</button><button className={canvasTool === "box" ? "active" : ""} onClick={() => setCanvasTool("box")}>□ {t("框选")}</button><span /><button onClick={() => versions.length > 0 && restoreVersion(versions[0])} title={language === "en" ? "Restore initial version" : "恢复初始版本"}>↶</button><button disabled title={language === "en" ? "No redo step" : "暂无重做步骤"}>↷</button></div><div><button onClick={() => setCanvasZoom((value) => Math.max(40, value - 10))}>−</button><b>{canvasZoom}%</b><button onClick={() => setCanvasZoom((value) => Math.min(140, value + 10))}>＋</button><button onClick={() => setCanvasZoom(78)}>{t("适应画布")}</button><button className={inspectorVisible ? "active" : ""} onClick={() => setInspectorVisible((value) => !value)}>☷ {t("属性面板")}</button></div></div>
          <div className={`floorplan-wrap ${generated ? "generated" : ""}`}>
            {generated && <div className="success-toast"><span>✓</span><div><b>{language === "en" ? "V3 created: 8 standard booths added" : "V3 已创建：新增 8 个标准展位"}</b><small>{language === "en" ? "Booths 15 → 21 · 0 sold booths changed · Rules recalculated" : "展位 15 → 21 · 已售展位 0 个变更 · 规则结果已重算"}</small></div><button onClick={() => setGenerated(false)}>×</button></div>}
            <div className="floorplan professional-cad" style={{ transform: `scale(${canvasZoom / 78})`, transformOrigin: "center center" }}>
              <div className="hall-label"><b>N3</b><span>{language === "en" ? "2026 CHINA INTERNATIONAL FOOD EXPO" : "2026 中国国际食品展"}</span></div>
              <div className="cad-dimension top"><i /><b>96.0 m</b><i /></div><div className="cad-dimension side"><i /><b>54.0 m</b><i /></div>
              <div className="cad-north"><b>N</b><i />{language === "en" ? "NORTH" : "北"}</div>
              <div className="cad-service-strip top-strip"><span>{t("消防控制")}</span><span>{t("主办办公室")}</span><span>{t("设备间")}</span><span>{t("仓储")}</span></div>
              <div className="cad-service-strip bottom-strip"><span>{t("装卸通道")} L-01</span><span>LOADING 02</span><span>LOADING 03</span><span>{t("仓储")} S-04</span></div>
              <div className="cad-side-room left-room"><span>WC</span><span>ELEC.</span><span>{t("消防栓")}</span></div><div className="cad-side-room right-room"><span>STAIR</span><span>LIFT</span><span>FHC</span></div>
              <div className="cad-door north-door"><i /><i /><b>{t("北入口 · NORTH")}</b></div><div className="cad-door south-door"><i /><i /><b>{t("紧急出口")}</b></div>
              <div className="cad-zone z1">A · {t("食品机械区")}</div><div className="cad-zone z2">B · {t("包装技术区")}</div><div className="cad-zone z3">C · {t("配套服务区")}</div>
              {cadColumns.map(([x, y], index) => <span className="cad-column" key={`${x}-${y}`} style={{ left: `${10 + x * .82}%`, top: `${14 + y * .72}%` }}><b>C{String(index + 1).padStart(2, "0")}</b></span>)}
              <div className="aisle vertical one">{t("6m 主通道")}</div><div className="aisle vertical two">{t("6m 主通道")}</div><div className="aisle horizontal">{t("4m 横向通道")}</div>
              {planBooths.map((booth) => <button key={booth.id} className={`booth ${selectedId === booth.id ? "selected" : ""} ${activeType !== "全部" && activeType !== booth.type ? "muted" : ""} ${booth.id.startsWith("n") ? "new-booth" : ""}`} style={{ left: `${10 + booth.x * .82}%`, top: `${14 + booth.y * .72}%`, width: `${booth.w * .82}%`, height: `${booth.h * .72}%`, background: typeColors[booth.type] }} onClick={() => setSelectedId(booth.id)} aria-label={`${booth.number} ${t(booth.type)} ${booth.area}㎡`}><b>{booth.number}</b><span>{getBoothDimensions(booth.area).join(" × ")} m · {booth.area}㎡</span>{booth.id.startsWith("n") && <em>{t("新增")}</em>}{!booth.id.startsWith("n") && booth.status !== "可售" && <em>{t(booth.status)}</em>}<i className="booth-open-edge" /></button>)}
              <div className="entry left">↔ {t("西入口")}</div><div className="entry right">{t("东入口")} ↔</div>
              <div className="cad-titleblock"><b>N3 HALL · BOOTH LAYOUT</b><span>DWG: MICECAD-AI-N3-V{currentVersionId.slice(1)}</span><span>SCALE 1:500 · UNIT: m</span></div>
            </div>
            <div className="legend"><span className="legend-title">{t("图例")}</span>{(["全部", "标准展位", "光地", "特装展位", "功能区"] as const).map((type) => <button key={type} className={activeType === type ? "active" : ""} onClick={() => setActiveType(type)}>{type !== "全部" && <i style={{ background: typeColors[type] }} />}{t(type)}</button>)}</div>
          </div>
          <div className="statusbar"><span>{t("当前版本")} <b>{currentVersionId}</b></span><span>{t("展位")} <b>{planBooths.length}</b>{language === "zh" && " 个"}</span><span>{t("示例面积")} <b>{stats.totalArea.toLocaleString()}</b> ㎡</span><span>{t("可售")} <b>{stats.available}</b>{language === "zh" && " 个"}</span><button className={`rule-status ${ruleCounts.blocked ? "blocked" : ""}`} onClick={() => setShowValidation(true)}><i />{ruleCounts.passed} {t("项通过")} · {ruleCounts.warned} {t("项提醒")} · {ruleCounts.blocked} {t("项阻断")} →</button></div>
        </section>
        {inspectorVisible && <aside className="inspector"><div className="inspector-head"><div><span>{t("当前选中")}</span><h2>{selected.number}</h2></div><button onClick={() => setInspectorVisible(false)}>×</button></div><div className={`status-chip ${selected.status}`}>{t(selected.status)}</div><section><h3>{t("展位信息")}</h3><dl><div><dt>{t("展位类型")}</dt><dd>{t(selected.type)}</dd></div><div><dt>{t("展位面积")}</dt><dd>{selected.area} ㎡</dd></div><div><dt>{t("开口方向")}</dt><dd>{t("双开口")}</dd></div><div><dt>{t("所在展区")}</dt><dd>{t(selectedZone)}</dd></div></dl></section><section><h3>{t("尺寸与位置")}</h3><div className="dimension-box"><span><small>{t("宽度")}</small><b>{selectedDimensions[0].toFixed(1)} m</b></span><span>×</span><span><small>{t("深度")}</small><b>{selectedDimensions[1].toFixed(1)} m</b></span></div><p className="distance">{t("距最近主通道")} <b>{selectedAisleDistance} m</b></p></section><section><h3>{t("销售设置")}</h3><label className="toggle-line"><span><b>{t("允许在线选位")}</b><small>{t("销售人员可为客户锁定")}</small></span><input type="checkbox" defaultChecked /></label><label>{t("展位价格")}<div className="price-input"><span>¥</span><input defaultValue="1,880" /><em>/ ㎡</em></div></label></section><div className="evidence-card"><header><span>✦</span><b>{t("位置建议 · 示例")}</b></header><p>{language === "en" ? (selected.id.startsWith("n") ? "This booth was generated by the V3 revision and passed boundary, overlap, numbering and sold-booth checks." : `This ${selectedDimensions[0]} × ${selectedDimensions[1]} m booth is assigned to the ${t(selectedZone)} and is adjacent to a coded circulation route.`) : (selected.id.startsWith("n") ? "该展位由 V3 修改生成，已通过边界、重叠、编号与已售保护检查。" : `该 ${selectedDimensions[0]} × ${selectedDimensions[1]} m 展位位于${selectedZone}，并与编号通道相邻。`)}</p><dl><div><dt>{t("对象来源")}</dt><dd>{t(selected.id.startsWith("n") ? "V3 AI 修改" : "V2 候选方案")}</dd></div><div><dt>{t("主通道相邻")}</dt><dd>{t(selectedAisleAdjacent ? "是" : "否")}</dd></div></dl><small>{language === "en" ? "The recommendation is derived from the current geometry, zone assignment and version record." : "建议依据当前几何、展区归属与版本记录生成。"}</small></div><button className="danger-ghost" onClick={() => setShowDeleteConfirm(true)}>{t("删除此展位")}</button></aside>}
      </section>
      {showValidation && <ValidationDialog language={language} results={ruleResults} onClose={() => setShowValidation(false)} />}{showHistory && <VersionHistoryDialog language={language} versions={versions} currentVersionId={currentVersionId} onRestore={restoreVersion} onClose={() => setShowHistory(false)} />}{showSubmit && <SubmitDialog language={language} onClose={() => setShowSubmit(false)} />}{showExport && <ExportDialog language={language} booths={planBooths} version={currentVersionId} ruleResults={ruleResults} onClose={() => setShowExport(false)} />}{showDeleteConfirm && <DeleteBoothDialog language={language} booth={selected} onClose={() => setShowDeleteConfirm(false)} onConfirm={deleteSelectedBooth} />}
    </main>
  );
}

function FlowSteps({ active, compact = false, language }: { active: number; compact?: boolean; language: Language }) {
  const steps = ["导入底图", "确认要求", "候选方案", "规划修改", "专业交付"];
  return <div className={`flow-steps ${compact ? "compact" : ""}`}>{steps.map((item, index) => <div className={active === index + 1 ? "active" : active > index + 1 ? "done" : ""} key={item}><span>{active > index + 1 ? "✓" : index + 1}</span><b>{translate(item, language)}</b>{index < steps.length - 1 && <i />}</div>)}</div>;
}

function CreateDialog({ language, brief, sourceFile, onBriefChange, onClose, onAnalyze, onImport, onUseSample, onTemplate, onExisting }: { language: Language; brief: string; sourceFile: string; onBriefChange: (brief: string) => void; onClose: () => void; onAnalyze: () => void; onImport: (file?: File) => void; onUseSample: () => void; onTemplate: () => void; onExisting: () => void }) {
  const t = (text: string) => translate(text, language);
  const ready = brief.trim().length > 0 && sourceFile.length > 0;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><section className="create-dialog" role="dialog" aria-modal="true" aria-labelledby="create-title"><button className="modal-close" onClick={onClose}>×</button><div className="dialog-hero"><div><span>{t("创建展位规划项目")}</span><h2 id="create-title">{t("输入规划需求并选择底图")}</h2><p>{t("生成布局必须同时具备规划需求和空间依据。")}</p></div><MiniPlan tone="blue" dense /></div><div className="dialog-group project-input-group"><h3>{t("项目输入")}</h3><label className="brief-field">{t("规划需求")}<textarea value={t(brief)} onChange={(event) => onBriefChange(event.target.value)} aria-label={t("规划需求")} /></label><h3>{t("空间依据")}</h3><div className="source-choice-grid"><label htmlFor="modal-file" className={sourceFile && sourceFile !== "N3馆主办方底图.pdf" ? "selected" : ""}><span className="quick-icon green">↥</span><div><b>{t("上传场馆底图")}</b><small>{t("上传 PDF、DXF、PNG 或 JPG")}</small></div><em>{sourceFile && sourceFile !== "N3馆主办方底图.pdf" ? "✓" : "→"}</em><input id="modal-file" type="file" accept=".pdf,.dxf,.png,.jpg,.jpeg" onChange={(event) => onImport(event.target.files?.[0])} /></label><button className={sourceFile === "N3馆主办方底图.pdf" ? "selected" : ""} onClick={onUseSample}><span className="quick-icon violet">▦</span><div><b>{t("使用 N3 馆示例底图")}</b><small>{t("课程演示底图，包含边界、出入口和固定柱位")}</small></div><em>{sourceFile === "N3馆主办方底图.pdf" ? "✓" : "→"}</em></button></div><div className={`source-status ${sourceFile ? "ready" : ""}`}><span>{sourceFile ? "✓" : "!"}</span><b>{sourceFile ? `${t("已选择底图")}：${language === "en" && sourceFile === "N3馆主办方底图.pdf" ? "N3_Organizer_Base_Plan.pdf" : sourceFile}` : t("尚未选择底图")}</b></div><button className="primary analyze-project" disabled={!ready} title={!sourceFile ? t("请先上传或选择场馆底图") : undefined} onClick={onAnalyze}>{t("分析需求并确认约束 →")}</button>{!sourceFile && <p className="input-warning">{t("请先上传或选择场馆底图")}</p>}</div><div className="dialog-group"><h3>{t("其他方式")}</h3><div className="dialog-grid"><button onClick={onExisting}><span className="quick-icon blue">⌁</span><div><b>{t("修改现有展位方案")}</b><small>{t("进入工作台进行对象级修改")}</small></div><em>→</em></button><button onClick={onTemplate}><span className="quick-icon amber">▦</span><div><b>{t("从行业模板开始")}</b><small>{t("复用展区、配比与规则设置")}</small></div><em>→</em></button></div></div></section></div>;
}

function TemplateConfigDialog({ language, template, onClose, onApply }: { language: Language; template: TemplatePreset; onClose: () => void; onApply: (template: TemplatePreset) => void }) {
  const t = (text: string) => translate(text, language);
  const [draft, setDraft] = useState(template);
  const ratioTotal = draft.standard + draft.raw + draft.custom;
  const updateNumber = (key: "standard" | "raw" | "custom" | "mainAisle" | "targetBooths", value: string) => setDraft((current) => ({ ...current, [key]: Number(value) }));
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><section className="template-dialog" role="dialog" aria-modal="true" aria-labelledby="template-title"><button className="modal-close" onClick={onClose}>×</button><header><div><span>{t("方案模板")}</span><h2 id="template-title">{t("配置模板参数")}</h2><p>{t("先调整参数，再把模板应用到真实展馆底图。")}</p></div><MiniPlan tone={template.tone} dense /></header><div className="template-dialog-body"><div className="template-dialog-title"><b>{t(template.name)}</b><span>{t(template.note)}</span></div><div className="template-fields"><label>{t("目标展位数")}<input type="number" min="20" max="500" value={draft.targetBooths} onChange={(event) => updateNumber("targetBooths", event.target.value)} /></label><label>{t("主通道宽度")}<div><input type="number" min="3" max="12" step="0.5" value={draft.mainAisle} onChange={(event) => updateNumber("mainAisle", event.target.value)} /><span>m</span></div></label></div><h3>{t("展位配比")} <em className={ratioTotal === 100 ? "valid" : "invalid"}>{ratioTotal}%</em></h3><div className="ratio-fields"><label>{t("标准展位比例")}<input type="number" min="0" max="100" value={draft.standard} onChange={(event) => updateNumber("standard", event.target.value)} /><span>%</span></label><label>{t("光地比例")}<input type="number" min="0" max="100" value={draft.raw} onChange={(event) => updateNumber("raw", event.target.value)} /><span>%</span></label><label>{t("特装比例")}<input type="number" min="0" max="100" value={draft.custom} onChange={(event) => updateNumber("custom", event.target.value)} /><span>%</span></label></div>{ratioTotal !== 100 && <p className="field-error">! {t("配比总和必须为 100%")}</p>}<label className="zone-field">{t("建议展区")}<input value={language === "en" ? t(draft.zones) : draft.zones} onChange={(event) => setDraft((current) => ({ ...current, zones: event.target.value }))} /></label><div className="template-rule-preview"><b>{t("规则预览")}</b><span>✓ {t("通道净宽")} ≥ {draft.mainAisle} m</span><span>✓ {t("消防出口净空")}</span><span>✓ {t("已售展位保护")}</span></div></div><footer><button className="secondary" onClick={onClose}>{t("取消")}</button><button className="primary" disabled={ratioTotal !== 100} onClick={() => onApply(draft)}>{t("应用模板并确认要求 →")}</button></footer></section></div>;
}

function RuleSettingsDialog({ language, rule, settings, onClose, onSave }: { language: Language; rule: RuleDefinition; settings?: { enabled: boolean; threshold?: number }; onClose: () => void; onSave: (settings: { enabled: boolean; threshold?: number }) => void }) {
  const t = (text: string) => translate(text, language);
  const [enabled, setEnabled] = useState(settings?.enabled ?? true);
  const [threshold, setThreshold] = useState(settings?.threshold ?? rule.threshold);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><section className="rule-dialog" role="dialog" aria-modal="true" aria-labelledby="rule-title"><button className="modal-close" onClick={onClose}>×</button><header><span>{t(rule.tag)}</span><h2 id="rule-title">{t(rule.title)}</h2><p>{t(rule.text)}</p></header><div className="rule-detail-grid"><article><span>01</span><div><b>{t("检查对象")}</b><p>{t(rule.input)}</p></div></article><article><span>02</span><div><b>{t("触发时机")}</b><p>{t(rule.trigger)}</p></div></article><article><span>03</span><div><b>{t("处理结果")}</b><p>{t(rule.action)}</p></div></article></div>{rule.threshold !== undefined && <label className="threshold-field">{t("规则阈值")}<div><input type="number" min="0" step={rule.unit === "m" ? "0.5" : "1"} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /><span>{rule.unit}</span></div></label>}<label className="rule-enabled"><span><b>{t("在此项目中启用")}</b><small>{language === "en" ? "This setting immediately affects live rule checks." : "此设置会立即影响实时规则检查。"}</small></span><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /></label><footer><button className="secondary" onClick={onClose}>{t("取消")}</button><button className="primary" onClick={() => onSave({ enabled, threshold })}>{t("保存项目设置")}</button></footer></section></div>;
}

function downloadTextFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ExportDialog({ language, booths, version, ruleResults, onClose }: { language: Language; booths: Booth[]; version: string; ruleResults: RuleResult[]; onClose: () => void }) {
  const t = (text: string) => translate(text, language);
  const exportDxf = () => {
    const entities = booths.map((booth) => `0\nLWPOLYLINE\n8\nBOOTHS\n90\n4\n70\n1\n10\n${booth.x}\n20\n${booth.y}\n10\n${booth.x + booth.w}\n20\n${booth.y}\n10\n${booth.x + booth.w}\n20\n${booth.y + booth.h}\n10\n${booth.x}\n20\n${booth.y + booth.h}\n0\nTEXT\n8\nBOOTH_NUMBERS\n10\n${booth.x + 1}\n20\n${booth.y + 1}\n40\n1\n1\n${booth.number}`).join("\n");
    downloadTextFile(`MICECAD_AI_${version}.dxf`, `0\nSECTION\n2\nENTITIES\n${entities}\n0\nENDSEC\n0\nEOF`, "application/dxf");
  };
  const exportCsv = () => downloadTextFile(`MICECAD_AI_${version}_booths.csv`, `number,type,area,status,x,y,width,height\n${booths.map((booth) => [booth.number, t(booth.type), booth.area, t(booth.status), booth.x, booth.y, booth.w, booth.h].join(",")).join("\n")}`, "text/csv;charset=utf-8");
  return <div className="modal-backdrop"><section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title"><button className="modal-close" onClick={onClose}>×</button><header><span>↧</span><div><h2 id="export-title">{t("导出交付预览")}</h2><p>{t("导出内容来自当前画布与实时规则结果。")}</p></div></header><div className="export-preview"><MiniPlan tone="blue" dense /><div><b>N3 HALL · {version}</b><p>{booths.length} {language === "en" ? "booth objects" : "个展位对象"}</p><p>{ruleResults.filter((rule) => rule.status === "通过").length} {t("项通过")} · {ruleResults.filter((rule) => rule.status === "提醒").length} {t("项提醒")} · {ruleResults.filter((rule) => rule.status === "阻断").length} {t("项阻断")}</p></div></div><div className="export-list"><p><span>✓</span>{t("展位对象与编号")}</p><p><span>✓</span>{t("规则检查报告")}</p><p><span>✓</span>{t("版本与项目信息")}</p></div><footer><button className="secondary" onClick={exportCsv}>{t("下载 CSV 数据")}</button><button className="primary" onClick={exportDxf}>{t("下载 DXF 演示文件")}</button></footer></section></div>;
}

function DeleteBoothDialog({ language, booth, onClose, onConfirm }: { language: Language; booth: Booth; onClose: () => void; onConfirm: () => void }) {
  const t = (text: string) => translate(text, language);
  return <div className="modal-backdrop"><section className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><span className="delete-mark">!</span><h2 id="delete-title">{t("删除展位")} {booth.number}?</h2><p>{t("删除后将立即从当前方案移除此对象，并重新计算边界、编号、配比和已售保护规则。")}</p><div><button className="secondary" onClick={onClose}>{t("取消")}</button><button className="danger-button" onClick={onConfirm}>{t("确认删除")}</button></div></section></div>;
}

function ValidationDialog({ language, results, onClose }: { language: Language; results: RuleResult[]; onClose: () => void }) {
  const t = (text: string) => translate(text, language);
  const passed = results.filter((rule) => rule.status === "通过").length;
  const warned = results.filter((rule) => rule.status === "提醒").length;
  const blocked = results.filter((rule) => rule.status === "阻断").length;
  const score = Math.round(passed / results.length * 100);
  return <div className="modal-backdrop"><section className="validation-dialog" role="dialog" aria-modal="true" aria-labelledby="validation-title"><header><div><span>{language === "en" ? "LIVE RULE CHECK · CURRENT BOOTH DATA" : "实时规则检查 · 当前展位数据"}</span><h2 id="validation-title">{language === "en" ? `${passed} passed, ${warned} warnings, ${blocked} blocking` : `${passed} 项通过，${warned} 项提醒，${blocked} 项阻断`}</h2><p>{language === "en" ? "Results are calculated from the current booth objects, not from fixed success copy." : "结果由当前画布中的展位对象实时计算，不是固定成功文案。"}</p></div><button onClick={onClose}>×</button></header><div className="validation-summary"><div className="score"><b>{score}%</b><span>{language === "en" ? "PASS RATE" : "当前通过率"}</span></div><div><p><i className="pass" />{passed} {t("项通过")}</p><p><i className="warn" />{warned} {t("项提醒")}</p><p><i className="block" />{blocked} {t("项阻断")}</p></div></div><div className="validation-list">{results.map((rule) => <article key={rule.title}><span className={rule.status === "通过" ? "pass" : rule.status === "提醒" ? "warn" : "block"}>{rule.status === "通过" ? "✓" : "!"}</span><div><b>{t(rule.title)}</b><small>{t(rule.detail)}</small></div><em className={rule.status === "通过" ? "pass" : rule.status === "提醒" ? "warn" : "block"}>{t(rule.status)}</em><button onClick={onClose}>{t("查看对象")}</button></article>)}</div><footer><button className="secondary" onClick={onClose}>{t("关闭")}</button>{warned > 0 && <button className="primary" onClick={onClose}>{t("查看配比调整建议 →")}</button>}</footer></section></div>;
}

function VersionHistoryDialog({ language, versions, currentVersionId, onRestore, onClose }: { language: Language; versions: PlanVersion[]; currentVersionId: string; onRestore: (version: PlanVersion) => void; onClose: () => void }) {
  const t = (text: string) => translate(text, language);
  return <div className="modal-backdrop"><section className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-title"><header><div><span>{t("对象级版本记录")}</span><h2 id="history-title">{t("方案 B 的修改历史")}</h2><p>{t("恢复版本会同时恢复展位对象、数量、面积和规则结果。")}</p></div><button onClick={onClose}>×</button></header><div className="history-list">{[...versions].reverse().map((version, index) => <article className={version.id === currentVersionId ? "current" : ""} key={version.id}><div className="timeline"><span>{version.id === currentVersionId ? "✓" : ""}</span>{index < versions.length - 1 && <i />}</div><div><header><b>{version.id} · {t(version.title)}</b>{version.id === currentVersionId && <em>{t("当前版本")}</em>}</header><p>{language === "en" ? (version.id === "V2" ? "15 sample booths · rule pre-check" : "8 standard booths added · 3 sold booths preserved") : version.detail}</p><small>{t(version.id === "V2" ? "初始候选方案" : "由 AI 修改预览确认后创建")}</small></div><button disabled={version.id === currentVersionId} onClick={() => onRestore(version)}>{t(version.id === currentVersionId ? "正在使用" : "恢复此版本")}</button></article>)}</div><footer><button className="secondary" onClick={onClose}>{t("关闭")}</button></footer></section></div>;
}

function SubmitDialog({ language, onClose }: { language: Language; onClose: () => void }) {
  const t = (text: string) => translate(text, language);
  return <div className="modal-backdrop"><section className="submit-dialog" role="dialog" aria-modal="true" aria-labelledby="submit-title"><button className="modal-close" onClick={onClose}>×</button><span className="submit-mark">M</span><h2 id="submit-title">{t("提交 MICECAD 专业绘制")}</h2><p>{t("把已确认的底图、约束、候选方案和修改记录整理为专业绘制任务。")}</p><div className="handoff-list"><p><span>✓</span>{t("当前方案与展位对象")}</p><p><span>✓</span>{t("规划要求及其来源")}</p><p><span>✓</span>{t("规则检查与待确认事项")}</p><p><span>✓</span>{t("版本记录和销售属性")}</p></div><label>{t("补充说明")}<textarea defaultValue={language === "en" ? "Please complete the professional booth drawing for Plan B and verify booth numbering and fire aisles." : "请按照方案 B 完成专业展位图绘制，并核对展位编号与消防通道。"} /></label><button className="primary" onClick={onClose}>{t("确认提交演示任务 →")}</button><small>{t("这是课程原型中的交互演示，不会实际发送外部任务。")}</small></section></div>;
}
