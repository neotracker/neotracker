declare type k8s$ControllerRevision = {
  apiVersion?: string;
  data?: k8s$RawExtension;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  revision: number;
};
declare type k8s$ControllerRevisionList = {
  apiVersion?: string;
  items: Array<k8s$ControllerRevision>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$Deployment = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$DeploymentSpec;
  status?: k8s$DeploymentStatus;
};
declare type k8s$DeploymentCondition = {
  lastTransitionTime?: k8s$Time;
  lastUpdateTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$DeploymentList = {
  apiVersion?: string;
  items: Array<k8s$Deployment>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$DeploymentRollback = {
  apiVersion?: string;
  kind?: string;
  name: string;
  rollbackTo: k8s$RollbackConfig;
  updatedAnnotations?: object;
};
declare type k8s$DeploymentSpec = {
  minReadySeconds?: number;
  paused?: boolean;
  progressDeadlineSeconds?: number;
  replicas?: number;
  revisionHistoryLimit?: number;
  rollbackTo?: k8s$RollbackConfig;
  selector?: k8s$LabelSelector;
  strategy?: k8s$DeploymentStrategy;
  template: k8s$PodTemplateSpec;
};
declare type k8s$DeploymentStatus = {
  availableReplicas?: number;
  collisionCount?: number;
  conditions?: Array<k8s$DeploymentCondition>;
  observedGeneration?: number;
  readyReplicas?: number;
  replicas?: number;
  unavailableReplicas?: number;
  updatedReplicas?: number;
};
declare type k8s$DeploymentStrategy = {
  rollingUpdate?: k8s$RollingUpdateDeployment;
  type?: string;
};
declare type k8s$RollbackConfig = { revision?: number };
declare type k8s$RollingUpdateDeployment = {
  maxSurge?: k8s$IntOrString;
  maxUnavailable?: k8s$IntOrString;
};
declare type k8s$RollingUpdateStatefulSetStrategy = { partition?: number };
declare type k8s$Scale = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$ScaleSpec;
  status?: k8s$ScaleStatus;
};
declare type k8s$ScaleSpec = { replicas?: number };
declare type k8s$ScaleStatus = {
  replicas: number;
  selector?: object;
  targetSelector?: string;
};
declare type k8s$StatefulSet = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$StatefulSetSpec;
  status?: k8s$StatefulSetStatus;
};
declare type k8s$StatefulSetList = {
  apiVersion?: string;
  items: Array<k8s$StatefulSet>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$StatefulSetSpec = {
  podManagementPolicy?: string;
  replicas?: number;
  revisionHistoryLimit?: number;
  selector?: k8s$LabelSelector;
  serviceName: string;
  template: k8s$PodTemplateSpec;
  updateStrategy?: k8s$StatefulSetUpdateStrategy;
  volumeClaimTemplates?: Array<k8s$PersistentVolumeClaim>;
};
declare type k8s$StatefulSetStatus = {
  collisionCount?: number;
  currentReplicas?: number;
  currentRevision?: string;
  observedGeneration?: number;
  readyReplicas?: number;
  replicas: number;
  updateRevision?: string;
  updatedReplicas?: number;
};
declare type k8s$StatefulSetUpdateStrategy = {
  rollingUpdate?: k8s$RollingUpdateStatefulSetStrategy;
  type?: string;
};
declare type k8s$DaemonSet = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$DaemonSetSpec;
  status?: k8s$DaemonSetStatus;
};
declare type k8s$DaemonSetList = {
  apiVersion?: string;
  items: Array<k8s$DaemonSet>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$DaemonSetSpec = {
  minReadySeconds?: number;
  revisionHistoryLimit?: number;
  selector?: k8s$LabelSelector;
  template: k8s$PodTemplateSpec;
  updateStrategy?: k8s$DaemonSetUpdateStrategy;
};
declare type k8s$DaemonSetStatus = {
  collisionCount?: number;
  currentNumberScheduled: number;
  desiredNumberScheduled: number;
  numberAvailable?: number;
  numberMisscheduled: number;
  numberReady: number;
  numberUnavailable?: number;
  observedGeneration?: number;
  updatedNumberScheduled?: number;
};
declare type k8s$DaemonSetUpdateStrategy = {
  rollingUpdate?: k8s$RollingUpdateDaemonSet;
  type?: string;
};
declare type k8s$ReplicaSet = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$ReplicaSetSpec;
  status?: k8s$ReplicaSetStatus;
};
declare type k8s$ReplicaSetCondition = {
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$ReplicaSetList = {
  apiVersion?: string;
  items: Array<k8s$ReplicaSet>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$ReplicaSetSpec = {
  minReadySeconds?: number;
  replicas?: number;
  selector?: k8s$LabelSelector;
  template?: k8s$PodTemplateSpec;
};
declare type k8s$ReplicaSetStatus = {
  availableReplicas?: number;
  conditions?: Array<k8s$ReplicaSetCondition>;
  fullyLabeledReplicas?: number;
  observedGeneration?: number;
  readyReplicas?: number;
  replicas: number;
};
declare type k8s$RollingUpdateDaemonSet = {
  maxUnavailable?: k8s$IntOrString;
};
declare type k8s$TokenReview = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec: k8s$TokenReviewSpec;
  status?: k8s$TokenReviewStatus;
};
declare type k8s$TokenReviewSpec = { token?: string };
declare type k8s$TokenReviewStatus = {
  authenticated?: boolean;
  error?: string;
  user?: k8s$UserInfo;
};
declare type k8s$UserInfo = {
  extra?: object;
  groups?: Array<string>;
  uid?: string;
  username?: string;
};
declare type k8s$LocalSubjectAccessReview = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec: k8s$SubjectAccessReviewSpec;
  status?: k8s$SubjectAccessReviewStatus;
};
declare type k8s$NonResourceAttributes = { path?: string; verb?: string };
declare type k8s$NonResourceRule = {
  nonResourceURLs?: Array<string>;
  verbs: Array<string>;
};
declare type k8s$ResourceAttributes = {
  group?: string;
  name?: string;
  namespace?: string;
  resource?: string;
  subresource?: string;
  verb?: string;
  version?: string;
};
declare type k8s$ResourceRule = {
  apiGroups?: Array<string>;
  resourceNames?: Array<string>;
  resources?: Array<string>;
  verbs: Array<string>;
};
declare type k8s$SelfSubjectAccessReview = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec: k8s$SelfSubjectAccessReviewSpec;
  status?: k8s$SubjectAccessReviewStatus;
};
declare type k8s$SelfSubjectAccessReviewSpec = {
  nonResourceAttributes?: k8s$NonResourceAttributes;
  resourceAttributes?: k8s$ResourceAttributes;
};
declare type k8s$SelfSubjectRulesReview = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec: k8s$SelfSubjectRulesReviewSpec;
  status?: k8s$SubjectRulesReviewStatus;
};
declare type k8s$SelfSubjectRulesReviewSpec = { namespace?: string };
declare type k8s$SubjectAccessReview = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec: k8s$SubjectAccessReviewSpec;
  status?: k8s$SubjectAccessReviewStatus;
};
declare type k8s$SubjectAccessReviewSpec = {
  extra?: object;
  groups?: Array<string>;
  nonResourceAttributes?: k8s$NonResourceAttributes;
  resourceAttributes?: k8s$ResourceAttributes;
  uid?: string;
  user?: string;
};
declare type k8s$SubjectAccessReviewStatus = {
  allowed: boolean;
  evaluationError?: string;
  reason?: string;
};
declare type k8s$SubjectRulesReviewStatus = {
  evaluationError?: string;
  incomplete: boolean;
  nonResourceRules: Array<k8s$NonResourceRule>;
  resourceRules: Array<k8s$ResourceRule>;
};
declare type k8s$CrossVersionObjectReference = {
  apiVersion?: string;
  kind: string;
  name: string;
};
declare type k8s$HorizontalPodAutoscaler = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$HorizontalPodAutoscalerSpec;
  status?: k8s$HorizontalPodAutoscalerStatus;
};
declare type k8s$HorizontalPodAutoscalerList = {
  apiVersion?: string;
  items: Array<k8s$HorizontalPodAutoscaler>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$HorizontalPodAutoscalerSpec = {
  maxReplicas: number;
  minReplicas?: number;
  scaleTargetRef: k8s$CrossVersionObjectReference;
  targetCPUUtilizationPercentage?: number;
};
declare type k8s$HorizontalPodAutoscalerStatus = {
  currentCPUUtilizationPercentage?: number;
  currentReplicas: number;
  desiredReplicas: number;
  lastScaleTime?: k8s$Time;
  observedGeneration?: number;
};
declare type k8s$HorizontalPodAutoscalerCondition = {
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$MetricSpec = {
  object?: k8s$ObjectMetricSource;
  pods?: k8s$PodsMetricSource;
  resource?: k8s$ResourceMetricSource;
  type: string;
};
declare type k8s$MetricStatus = {
  object?: k8s$ObjectMetricStatus;
  pods?: k8s$PodsMetricStatus;
  resource?: k8s$ResourceMetricStatus;
  type: string;
};
declare type k8s$ObjectMetricSource = {
  metricName: string;
  target: k8s$CrossVersionObjectReference;
  targetValue: k8s$Quantity;
};
declare type k8s$ObjectMetricStatus = {
  currentValue: k8s$Quantity;
  metricName: string;
  target: k8s$CrossVersionObjectReference;
};
declare type k8s$PodsMetricSource = {
  metricName: string;
  targetAverageValue: k8s$Quantity;
};
declare type k8s$PodsMetricStatus = {
  currentAverageValue: k8s$Quantity;
  metricName: string;
};
declare type k8s$ResourceMetricSource = {
  name: string;
  targetAverageUtilization?: number;
  targetAverageValue?: k8s$Quantity;
};
declare type k8s$ResourceMetricStatus = {
  currentAverageUtilization?: number;
  currentAverageValue: k8s$Quantity;
  name: string;
};
declare type k8s$Job = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$JobSpec;
  status?: k8s$JobStatus;
};
declare type k8s$JobCondition = {
  lastProbeTime?: k8s$Time;
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$JobList = {
  apiVersion?: string;
  items: Array<k8s$Job>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$JobSpec = {
  activeDeadlineSeconds?: number;
  backoffLimit?: number;
  completions?: number;
  manualSelector?: boolean;
  parallelism?: number;
  selector?: k8s$LabelSelector;
  template: k8s$PodTemplateSpec;
};
declare type k8s$JobStatus = {
  active?: number;
  completionTime?: k8s$Time;
  conditions?: Array<k8s$JobCondition>;
  failed?: number;
  startTime?: k8s$Time;
  succeeded?: number;
};
declare type k8s$CronJob = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$CronJobSpec;
  status?: k8s$CronJobStatus;
};
declare type k8s$CronJobList = {
  apiVersion?: string;
  items: Array<k8s$CronJob>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$CronJobSpec = {
  concurrencyPolicy?: string;
  failedJobsHistoryLimit?: number;
  jobTemplate: k8s$JobTemplateSpec;
  schedule: string;
  startingDeadlineSeconds?: number;
  successfulJobsHistoryLimit?: number;
  suspend?: boolean;
};
declare type k8s$CronJobStatus = {
  active?: Array<k8s$ObjectReference>;
  lastScheduleTime?: k8s$Time;
};
declare type k8s$JobTemplateSpec = {
  metadata?: k8s$ObjectMeta;
  spec?: k8s$JobSpec;
};
declare type k8s$CertificateSigningRequest = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$CertificateSigningRequestSpec;
  status?: k8s$CertificateSigningRequestStatus;
};
declare type k8s$CertificateSigningRequestCondition = {
  lastUpdateTime?: k8s$Time;
  message?: string;
  reason?: string;
  type: string;
};
declare type k8s$CertificateSigningRequestList = {
  apiVersion?: string;
  items: Array<k8s$CertificateSigningRequest>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$CertificateSigningRequestSpec = {
  extra?: object;
  groups?: Array<string>;
  request: string;
  uid?: string;
  usages?: Array<string>;
  username?: string;
};
declare type k8s$CertificateSigningRequestStatus = {
  certificate?: string;
  conditions?: Array<k8s$CertificateSigningRequestCondition>;
};
declare type k8s$AWSElasticBlockStoreVolumeSource = {
  fsType?: string;
  partition?: number;
  readOnly?: boolean;
  volumeID: string;
};
declare type k8s$Affinity = {
  nodeAffinity?: k8s$NodeAffinity;
  podAffinity?: k8s$PodAffinity;
  podAntiAffinity?: k8s$PodAntiAffinity;
};
declare type k8s$AttachedVolume = { devicePath: string; name: string };
declare type k8s$AzureDiskVolumeSource = {
  cachingMode?: string;
  diskName: string;
  diskURI: string;
  fsType?: string;
  kind?: string;
  readOnly?: boolean;
};
declare type k8s$AzureFilePersistentVolumeSource = {
  readOnly?: boolean;
  secretName: string;
  secretNamespace?: string;
  shareName: string;
};
declare type k8s$AzureFileVolumeSource = {
  readOnly?: boolean;
  secretName: string;
  shareName: string;
};
declare type k8s$Binding = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  target: k8s$ObjectReference;
};
declare type k8s$Capabilities = { add?: Array<string>; drop?: Array<string> };
declare type k8s$CephFSPersistentVolumeSource = {
  monitors: Array<string>;
  path?: string;
  readOnly?: boolean;
  secretFile?: string;
  secretRef?: k8s$SecretReference;
  user?: string;
};
declare type k8s$CephFSVolumeSource = {
  monitors: Array<string>;
  path?: string;
  readOnly?: boolean;
  secretFile?: string;
  secretRef?: k8s$LocalObjectReference;
  user?: string;
};
declare type k8s$CinderVolumeSource = {
  fsType?: string;
  readOnly?: boolean;
  volumeID: string;
};
declare type k8s$ClientIPConfig = { timeoutSeconds?: number };
declare type k8s$ComponentCondition = {
  error?: string;
  message?: string;
  status: string;
  type: string;
};
declare type k8s$ComponentStatus = {
  apiVersion?: string;
  conditions?: Array<k8s$ComponentCondition>;
  kind?: string;
  metadata?: k8s$ObjectMeta;
};
declare type k8s$ComponentStatusList = {
  apiVersion?: string;
  items: Array<k8s$ComponentStatus>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$ConfigMap = {
  apiVersion?: string;
  data?: object;
  kind?: string;
  metadata?: k8s$ObjectMeta;
};
declare type k8s$ConfigMapEnvSource = { name?: string; optional?: boolean };
declare type k8s$ConfigMapKeySelector = {
  key: string;
  name?: string;
  optional?: boolean;
};
declare type k8s$ConfigMapList = {
  apiVersion?: string;
  items: Array<k8s$ConfigMap>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$ConfigMapProjection = {
  items?: Array<k8s$KeyToPath>;
  name?: string;
  optional?: boolean;
};
declare type k8s$ConfigMapVolumeSource = {
  defaultMode?: number;
  items?: Array<k8s$KeyToPath>;
  name?: string;
  optional?: boolean;
};
declare type k8s$Container = {
  args?: Array<string>;
  command?: Array<string>;
  env?: Array<k8s$EnvVar>;
  envFrom?: Array<k8s$EnvFromSource>;
  image?: string;
  imagePullPolicy?: string;
  lifecycle?: k8s$Lifecycle;
  livenessProbe?: k8s$Probe;
  name: string;
  ports?: Array<k8s$ContainerPort>;
  readinessProbe?: k8s$Probe;
  resources?: k8s$ResourceRequirements;
  securityContext?: k8s$SecurityContext;
  stdin?: boolean;
  stdinOnce?: boolean;
  terminationMessagePath?: string;
  terminationMessagePolicy?: string;
  tty?: boolean;
  volumeMounts?: Array<k8s$VolumeMount>;
  workingDir?: string;
};
declare type k8s$ContainerImage = {
  names: Array<string>;
  sizeBytes?: number;
};
declare type k8s$ContainerPort = {
  containerPort: number;
  hostIP?: string;
  hostPort?: number;
  name?: string;
  protocol?: string;
};
declare type k8s$ContainerState = {
  running?: k8s$ContainerStateRunning;
  terminated?: k8s$ContainerStateTerminated;
  waiting?: k8s$ContainerStateWaiting;
};
declare type k8s$ContainerStateRunning = { startedAt?: k8s$Time };
declare type k8s$ContainerStateTerminated = {
  containerID?: string;
  exitCode: number;
  finishedAt?: k8s$Time;
  message?: string;
  reason?: string;
  signal?: number;
  startedAt?: k8s$Time;
};
declare type k8s$ContainerStateWaiting = {
  message?: string;
  reason?: string;
};
declare type k8s$ContainerStatus = {
  containerID?: string;
  image: string;
  imageID: string;
  lastState?: k8s$ContainerState;
  name: string;
  ready: boolean;
  restartCount: number;
  state?: k8s$ContainerState;
};
declare type k8s$DaemonEndpoint = { Port: number };
declare type k8s$DownwardAPIProjection = {
  items?: Array<k8s$DownwardAPIVolumeFile>;
};
declare type k8s$DownwardAPIVolumeFile = {
  fieldRef?: k8s$ObjectFieldSelector;
  mode?: number;
  path: string;
  resourceFieldRef?: k8s$ResourceFieldSelector;
};
declare type k8s$DownwardAPIVolumeSource = {
  defaultMode?: number;
  items?: Array<k8s$DownwardAPIVolumeFile>;
};
declare type k8s$EmptyDirVolumeSource = {
  medium?: string;
  sizeLimit?: k8s$Quantity;
};
declare type k8s$EndpointAddress = {
  hostname?: string;
  ip: string;
  nodeName?: string;
  targetRef?: k8s$ObjectReference;
};
declare type k8s$EndpointPort = {
  name?: string;
  port: number;
  protocol?: string;
};
declare type k8s$EndpointSubset = {
  addresses?: Array<k8s$EndpointAddress>;
  notReadyAddresses?: Array<k8s$EndpointAddress>;
  ports?: Array<k8s$EndpointPort>;
};
declare type k8s$Endpoints = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  subsets: Array<k8s$EndpointSubset>;
};
declare type k8s$EndpointsList = {
  apiVersion?: string;
  items: Array<k8s$Endpoints>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$EnvFromSource = {
  configMapRef?: k8s$ConfigMapEnvSource;
  prefix?: string;
  secretRef?: k8s$SecretEnvSource;
};
declare type k8s$EnvVar = {
  name: string;
  value?: string;
  valueFrom?: k8s$EnvVarSource;
};
declare type k8s$EnvVarSource = {
  configMapKeyRef?: k8s$ConfigMapKeySelector;
  fieldRef?: k8s$ObjectFieldSelector;
  resourceFieldRef?: k8s$ResourceFieldSelector;
  secretKeyRef?: k8s$SecretKeySelector;
};
declare type k8s$Event = {
  apiVersion?: string;
  count?: number;
  firstTimestamp?: k8s$Time;
  involvedObject: k8s$ObjectReference;
  kind?: string;
  lastTimestamp?: k8s$Time;
  message?: string;
  metadata: k8s$ObjectMeta;
  reason?: string;
  source?: k8s$EventSource;
  type?: string;
};
declare type k8s$EventList = {
  apiVersion?: string;
  items: Array<k8s$Event>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$EventSource = { component?: string; host?: string };
declare type k8s$ExecAction = { command?: Array<string> };
declare type k8s$FCVolumeSource = {
  fsType?: string;
  lun?: number;
  readOnly?: boolean;
  targetWWNs?: Array<string>;
  wwids?: Array<string>;
};
declare type k8s$FlexVolumeSource = {
  driver: string;
  fsType?: string;
  options?: object;
  readOnly?: boolean;
  secretRef?: k8s$LocalObjectReference;
};
declare type k8s$FlockerVolumeSource = {
  datasetName?: string;
  datasetUUID?: string;
};
declare type k8s$GCEPersistentDiskVolumeSource = {
  fsType?: string;
  partition?: number;
  pdName: string;
  readOnly?: boolean;
};
declare type k8s$GitRepoVolumeSource = {
  directory?: string;
  repository: string;
  revision?: string;
};
declare type k8s$GlusterfsVolumeSource = {
  endpoints: string;
  path: string;
  readOnly?: boolean;
};
declare type k8s$HTTPGetAction = {
  host?: string;
  httpHeaders?: Array<k8s$HTTPHeader>;
  path?: string;
  port: k8s$IntOrString;
  scheme?: string;
};
declare type k8s$HTTPHeader = { name: string; value: string };
declare type k8s$Handler = {
  exec?: k8s$ExecAction;
  httpGet?: k8s$HTTPGetAction;
  tcpSocket?: k8s$TCPSocketAction;
};
declare type k8s$HostAlias = { hostnames?: Array<string>; ip?: string };
declare type k8s$HostPathVolumeSource = { path: string; type?: string };
declare type k8s$ISCSIVolumeSource = {
  chapAuthDiscovery?: boolean;
  chapAuthSession?: boolean;
  fsType?: string;
  initiatorName?: string;
  iqn: string;
  iscsiInterface?: string;
  lun: number;
  portals?: Array<string>;
  readOnly?: boolean;
  secretRef?: k8s$LocalObjectReference;
  targetPortal: string;
};
declare type k8s$KeyToPath = { key: string; mode?: number; path: string };
declare type k8s$Lifecycle = {
  postStart?: k8s$Handler;
  preStop?: k8s$Handler;
};
declare type k8s$LimitRange = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$LimitRangeSpec;
};
declare type k8s$LimitRangeItem = {
  default?: object;
  defaultRequest?: object;
  max?: object;
  maxLimitRequestRatio?: object;
  min?: object;
  type?: string;
};
declare type k8s$LimitRangeList = {
  apiVersion?: string;
  items: Array<k8s$LimitRange>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$LimitRangeSpec = { limits: Array<k8s$LimitRangeItem> };
declare type k8s$LoadBalancerIngress = { hostname?: string; ip?: string };
declare type k8s$LoadBalancerStatus = {
  ingress?: Array<k8s$LoadBalancerIngress>;
};
declare type k8s$LocalObjectReference = { name?: string };
declare type k8s$LocalVolumeSource = { path: string };
declare type k8s$NFSVolumeSource = {
  path: string;
  readOnly?: boolean;
  server: string;
};
declare type k8s$Namespace = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$NamespaceSpec;
  status?: k8s$NamespaceStatus;
};
declare type k8s$NamespaceList = {
  apiVersion?: string;
  items: Array<k8s$Namespace>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$NamespaceSpec = { finalizers?: Array<string> };
declare type k8s$NamespaceStatus = { phase?: string };
declare type k8s$Node = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$NodeSpec;
  status?: k8s$NodeStatus;
};
declare type k8s$NodeAddress = { address: string; type: string };
declare type k8s$NodeAffinity = {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<k8s$PreferredSchedulingTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: k8s$NodeSelector;
};
declare type k8s$NodeCondition = {
  lastHeartbeatTime?: k8s$Time;
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$NodeConfigSource = {
  apiVersion?: string;
  configMapRef?: k8s$ObjectReference;
  kind?: string;
};
declare type k8s$NodeDaemonEndpoints = {
  kubeletEndpoint?: k8s$DaemonEndpoint;
};
declare type k8s$NodeList = {
  apiVersion?: string;
  items: Array<k8s$Node>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$NodeSelector = {
  nodeSelectorTerms: Array<k8s$NodeSelectorTerm>;
};
declare type k8s$NodeSelectorRequirement = {
  key: string;
  operator: string;
  values?: Array<string>;
};
declare type k8s$NodeSelectorTerm = {
  matchExpressions: Array<k8s$NodeSelectorRequirement>;
};
declare type k8s$NodeSpec = {
  configSource?: k8s$NodeConfigSource;
  externalID?: string;
  podCIDR?: string;
  providerID?: string;
  taints?: Array<k8s$Taint>;
  unschedulable?: boolean;
};
declare type k8s$NodeStatus = {
  addresses?: Array<k8s$NodeAddress>;
  allocatable?: object;
  capacity?: object;
  conditions?: Array<k8s$NodeCondition>;
  daemonEndpoints?: k8s$NodeDaemonEndpoints;
  images?: Array<k8s$ContainerImage>;
  nodeInfo?: k8s$NodeSystemInfo;
  phase?: string;
  volumesAttached?: Array<k8s$AttachedVolume>;
  volumesInUse?: Array<string>;
};
declare type k8s$NodeSystemInfo = {
  architecture: string;
  bootID: string;
  containerRuntimeVersion: string;
  kernelVersion: string;
  kubeProxyVersion: string;
  kubeletVersion: string;
  machineID: string;
  operatingSystem: string;
  osImage: string;
  systemUUID: string;
};
declare type k8s$ObjectFieldSelector = {
  apiVersion?: string;
  fieldPath: string;
};
declare type k8s$ObjectReference = {
  apiVersion?: string;
  fieldPath?: string;
  kind?: string;
  name?: string;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
};
declare type k8s$PersistentVolume = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$PersistentVolumeSpec;
  status?: k8s$PersistentVolumeStatus;
};
declare type k8s$PersistentVolumeClaim = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$PersistentVolumeClaimSpec;
  status?: k8s$PersistentVolumeClaimStatus;
};
declare type k8s$PersistentVolumeClaimCondition = {
  lastProbeTime?: k8s$Time;
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$PersistentVolumeClaimList = {
  apiVersion?: string;
  items: Array<k8s$PersistentVolumeClaim>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$PersistentVolumeClaimSpec = {
  accessModes?: Array<string>;
  resources?: k8s$ResourceRequirements;
  selector?: k8s$LabelSelector;
  storageClassName?: string;
  volumeName?: string;
};
declare type k8s$PersistentVolumeClaimStatus = {
  accessModes?: Array<string>;
  capacity?: object;
  conditions?: Array<k8s$PersistentVolumeClaimCondition>;
  phase?: string;
};
declare type k8s$PersistentVolumeClaimVolumeSource = {
  claimName: string;
  readOnly?: boolean;
};
declare type k8s$PersistentVolumeList = {
  apiVersion?: string;
  items: Array<k8s$PersistentVolume>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$PersistentVolumeSpec = {
  accessModes?: Array<string>;
  awsElasticBlockStore?: k8s$AWSElasticBlockStoreVolumeSource;
  azureDisk?: k8s$AzureDiskVolumeSource;
  azureFile?: k8s$AzureFilePersistentVolumeSource;
  capacity?: object;
  cephfs?: k8s$CephFSPersistentVolumeSource;
  cinder?: k8s$CinderVolumeSource;
  claimRef?: k8s$ObjectReference;
  fc?: k8s$FCVolumeSource;
  flexVolume?: k8s$FlexVolumeSource;
  flocker?: k8s$FlockerVolumeSource;
  gcePersistentDisk?: k8s$GCEPersistentDiskVolumeSource;
  glusterfs?: k8s$GlusterfsVolumeSource;
  hostPath?: k8s$HostPathVolumeSource;
  iscsi?: k8s$ISCSIVolumeSource;
  local?: k8s$LocalVolumeSource;
  mountOptions?: Array<string>;
  nfs?: k8s$NFSVolumeSource;
  persistentVolumeReclaimPolicy?: string;
  photonPersistentDisk?: k8s$PhotonPersistentDiskVolumeSource;
  portworxVolume?: k8s$PortworxVolumeSource;
  quobyte?: k8s$QuobyteVolumeSource;
  rbd?: k8s$RBDVolumeSource;
  scaleIO?: k8s$ScaleIOVolumeSource;
  storageClassName?: string;
  storageos?: k8s$StorageOSPersistentVolumeSource;
  vsphereVolume?: k8s$VsphereVirtualDiskVolumeSource;
};
declare type k8s$PersistentVolumeStatus = {
  message?: string;
  phase?: string;
  reason?: string;
};
declare type k8s$PhotonPersistentDiskVolumeSource = {
  fsType?: string;
  pdID: string;
};
declare type k8s$Pod = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$PodSpec;
  status?: k8s$PodStatus;
};
declare type k8s$PodAffinity = {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<k8s$WeightedPodAffinityTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: Array<k8s$PodAffinityTerm>;
};
declare type k8s$PodAffinityTerm = {
  labelSelector?: k8s$LabelSelector;
  namespaces?: Array<string>;
  topologyKey?: string;
};
declare type k8s$PodAntiAffinity = {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<k8s$WeightedPodAffinityTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: Array<k8s$PodAffinityTerm>;
};
declare type k8s$PodCondition = {
  lastProbeTime?: k8s$Time;
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$PodList = {
  apiVersion?: string;
  items: Array<k8s$Pod>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$PodSecurityContext = {
  fsGroup?: number;
  runAsNonRoot?: boolean;
  runAsUser?: number;
  seLinuxOptions?: k8s$SELinuxOptions;
  supplementalGroups?: Array<number>;
};
declare type k8s$PodSpec = {
  activeDeadlineSeconds?: number;
  affinity?: k8s$Affinity;
  automountServiceAccountToken?: boolean;
  containers: Array<k8s$Container>;
  dnsPolicy?: string;
  hostAliases?: Array<k8s$HostAlias>;
  hostIPC?: boolean;
  hostNetwork?: boolean;
  hostPID?: boolean;
  hostname?: string;
  imagePullSecrets?: Array<k8s$LocalObjectReference>;
  initContainers?: Array<k8s$Container>;
  nodeName?: string;
  nodeSelector?: object;
  priority?: number;
  priorityClassName?: string;
  restartPolicy?: string;
  schedulerName?: string;
  securityContext?: k8s$PodSecurityContext;
  serviceAccount?: string;
  serviceAccountName?: string;
  subdomain?: string;
  terminationGracePeriodSeconds?: number;
  tolerations?: Array<k8s$Toleration>;
  volumes?: Array<k8s$Volume>;
};
declare type k8s$PodStatus = {
  conditions?: Array<k8s$PodCondition>;
  containerStatuses?: Array<k8s$ContainerStatus>;
  hostIP?: string;
  initContainerStatuses?: Array<k8s$ContainerStatus>;
  message?: string;
  phase?: string;
  podIP?: string;
  qosClass?: string;
  reason?: string;
  startTime?: k8s$Time;
};
declare type k8s$PodTemplate = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  template?: k8s$PodTemplateSpec;
};
declare type k8s$PodTemplateList = {
  apiVersion?: string;
  items: Array<k8s$PodTemplate>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$PodTemplateSpec = {
  metadata?: k8s$ObjectMeta;
  spec?: k8s$PodSpec;
};
declare type k8s$PortworxVolumeSource = {
  fsType?: string;
  readOnly?: boolean;
  volumeID: string;
};
declare type k8s$PreferredSchedulingTerm = {
  preference: k8s$NodeSelectorTerm;
  weight: number;
};
declare type k8s$Probe = {
  exec?: k8s$ExecAction;
  failureThreshold?: number;
  httpGet?: k8s$HTTPGetAction;
  initialDelaySeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  tcpSocket?: k8s$TCPSocketAction;
  timeoutSeconds?: number;
};
declare type k8s$ProjectedVolumeSource = {
  defaultMode?: number;
  sources: Array<k8s$VolumeProjection>;
};
declare type k8s$QuobyteVolumeSource = {
  group?: string;
  readOnly?: boolean;
  registry: string;
  user?: string;
  volume: string;
};
declare type k8s$RBDVolumeSource = {
  fsType?: string;
  image: string;
  keyring?: string;
  monitors: Array<string>;
  pool?: string;
  readOnly?: boolean;
  secretRef?: k8s$LocalObjectReference;
  user?: string;
};
declare type k8s$ReplicationController = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$ReplicationControllerSpec;
  status?: k8s$ReplicationControllerStatus;
};
declare type k8s$ReplicationControllerCondition = {
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$ReplicationControllerList = {
  apiVersion?: string;
  items: Array<k8s$ReplicationController>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$ReplicationControllerSpec = {
  minReadySeconds?: number;
  replicas?: number;
  selector?: object;
  template?: k8s$PodTemplateSpec;
};
declare type k8s$ReplicationControllerStatus = {
  availableReplicas?: number;
  conditions?: Array<k8s$ReplicationControllerCondition>;
  fullyLabeledReplicas?: number;
  observedGeneration?: number;
  readyReplicas?: number;
  replicas: number;
};
declare type k8s$ResourceFieldSelector = {
  containerName?: string;
  divisor?: k8s$Quantity;
  resource: string;
};
declare type k8s$ResourceQuota = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$ResourceQuotaSpec;
  status?: k8s$ResourceQuotaStatus;
};
declare type k8s$ResourceQuotaList = {
  apiVersion?: string;
  items: Array<k8s$ResourceQuota>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$ResourceQuotaSpec = {
  hard?: object;
  scopes?: Array<string>;
};
declare type k8s$ResourceQuotaStatus = { hard?: object; used?: object };
declare type k8s$ResourceRequirements = {
  limits?: object;
  requests?: object;
};
declare type k8s$SELinuxOptions = {
  level?: string;
  role?: string;
  type?: string;
  user?: string;
};
declare type k8s$ScaleIOVolumeSource = {
  fsType?: string;
  gateway: string;
  protectionDomain?: string;
  readOnly?: boolean;
  secretRef: k8s$LocalObjectReference;
  sslEnabled?: boolean;
  storageMode?: string;
  storagePool?: string;
  system: string;
  volumeName?: string;
};
declare type k8s$Secret = {
  apiVersion?: string;
  data?: object;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  stringData?: object;
  type?: string;
};
declare type k8s$SecretEnvSource = { name?: string; optional?: boolean };
declare type k8s$SecretKeySelector = {
  key: string;
  name?: string;
  optional?: boolean;
};
declare type k8s$SecretList = {
  apiVersion?: string;
  items: Array<k8s$Secret>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$SecretProjection = {
  items?: Array<k8s$KeyToPath>;
  name?: string;
  optional?: boolean;
};
declare type k8s$SecretReference = { name?: string; namespace?: string };
declare type k8s$SecretVolumeSource = {
  defaultMode?: number;
  items?: Array<k8s$KeyToPath>;
  optional?: boolean;
  secretName?: string;
};
declare type k8s$SecurityContext = {
  allowPrivilegeEscalation?: boolean;
  capabilities?: k8s$Capabilities;
  privileged?: boolean;
  readOnlyRootFilesystem?: boolean;
  runAsNonRoot?: boolean;
  runAsUser?: number;
  seLinuxOptions?: k8s$SELinuxOptions;
};
declare type k8s$Service = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$ServiceSpec;
  status?: k8s$ServiceStatus;
};
declare type k8s$ServiceAccount = {
  apiVersion?: string;
  automountServiceAccountToken?: boolean;
  imagePullSecrets?: Array<k8s$LocalObjectReference>;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  secrets?: Array<k8s$ObjectReference>;
};
declare type k8s$ServiceAccountList = {
  apiVersion?: string;
  items: Array<k8s$ServiceAccount>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$ServiceList = {
  apiVersion?: string;
  items: Array<k8s$Service>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$ServicePort = {
  name?: string;
  nodePort?: number;
  port: number;
  protocol?: string;
  targetPort?: k8s$IntOrString;
};
declare type k8s$ServiceSpec = {
  clusterIP?: string;
  externalIPs?: Array<string>;
  externalName?: string;
  externalTrafficPolicy?: string;
  healthCheckNodePort?: number;
  loadBalancerIP?: string;
  loadBalancerSourceRanges?: Array<string>;
  ports?: Array<k8s$ServicePort>;
  publishNotReadyAddresses?: boolean;
  selector?: object;
  sessionAffinity?: string;
  sessionAffinityConfig?: k8s$SessionAffinityConfig;
  type?: string;
};
declare type k8s$ServiceStatus = { loadBalancer?: k8s$LoadBalancerStatus };
declare type k8s$SessionAffinityConfig = { clientIP?: k8s$ClientIPConfig };
declare type k8s$StorageOSPersistentVolumeSource = {
  fsType?: string;
  readOnly?: boolean;
  secretRef?: k8s$ObjectReference;
  volumeName?: string;
  volumeNamespace?: string;
};
declare type k8s$StorageOSVolumeSource = {
  fsType?: string;
  readOnly?: boolean;
  secretRef?: k8s$LocalObjectReference;
  volumeName?: string;
  volumeNamespace?: string;
};
declare type k8s$TCPSocketAction = { host?: string; port: k8s$IntOrString };
declare type k8s$Taint = {
  effect: string;
  key: string;
  timeAdded?: k8s$Time;
  value?: string;
};
declare type k8s$Toleration = {
  effect?: string;
  key?: string;
  operator?: string;
  tolerationSeconds?: number;
  value?: string;
};
declare type k8s$Volume = {
  awsElasticBlockStore?: k8s$AWSElasticBlockStoreVolumeSource;
  azureDisk?: k8s$AzureDiskVolumeSource;
  azureFile?: k8s$AzureFileVolumeSource;
  cephfs?: k8s$CephFSVolumeSource;
  cinder?: k8s$CinderVolumeSource;
  configMap?: k8s$ConfigMapVolumeSource;
  downwardAPI?: k8s$DownwardAPIVolumeSource;
  emptyDir?: k8s$EmptyDirVolumeSource;
  fc?: k8s$FCVolumeSource;
  flexVolume?: k8s$FlexVolumeSource;
  flocker?: k8s$FlockerVolumeSource;
  gcePersistentDisk?: k8s$GCEPersistentDiskVolumeSource;
  gitRepo?: k8s$GitRepoVolumeSource;
  glusterfs?: k8s$GlusterfsVolumeSource;
  hostPath?: k8s$HostPathVolumeSource;
  iscsi?: k8s$ISCSIVolumeSource;
  name: string;
  nfs?: k8s$NFSVolumeSource;
  persistentVolumeClaim?: k8s$PersistentVolumeClaimVolumeSource;
  photonPersistentDisk?: k8s$PhotonPersistentDiskVolumeSource;
  portworxVolume?: k8s$PortworxVolumeSource;
  projected?: k8s$ProjectedVolumeSource;
  quobyte?: k8s$QuobyteVolumeSource;
  rbd?: k8s$RBDVolumeSource;
  scaleIO?: k8s$ScaleIOVolumeSource;
  secret?: k8s$SecretVolumeSource;
  storageos?: k8s$StorageOSVolumeSource;
  vsphereVolume?: k8s$VsphereVirtualDiskVolumeSource;
};
declare type k8s$VolumeMount = {
  mountPath: string;
  mountPropagation?: string;
  name: string;
  readOnly?: boolean;
  subPath?: string;
};
declare type k8s$VolumeProjection = {
  configMap?: k8s$ConfigMapProjection;
  downwardAPI?: k8s$DownwardAPIProjection;
  secret?: k8s$SecretProjection;
};
declare type k8s$VsphereVirtualDiskVolumeSource = {
  fsType?: string;
  storagePolicyID?: string;
  storagePolicyName?: string;
  volumePath: string;
};
declare type k8s$WeightedPodAffinityTerm = {
  podAffinityTerm: k8s$PodAffinityTerm;
  weight: number;
};
declare type k8s$HTTPIngressPath = {
  backend: k8s$IngressBackend;
  path?: string;
};
declare type k8s$HTTPIngressRuleValue = { paths: Array<k8s$HTTPIngressPath> };
declare type k8s$IPBlock = { cidr: string; except?: Array<string> };
declare type k8s$Ingress = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$IngressSpec;
  status?: k8s$IngressStatus;
};
declare type k8s$IngressBackend = {
  serviceName: string;
  servicePort: k8s$IntOrString;
};
declare type k8s$IngressList = {
  apiVersion?: string;
  items: Array<k8s$Ingress>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$IngressRule = {
  host?: string;
  http?: k8s$HTTPIngressRuleValue;
};
declare type k8s$IngressSpec = {
  backend?: k8s$IngressBackend;
  rules?: Array<k8s$IngressRule>;
  tls?: Array<k8s$IngressTLS>;
};
declare type k8s$IngressStatus = { loadBalancer?: k8s$LoadBalancerStatus };
declare type k8s$IngressTLS = { hosts?: Array<string>; secretName?: string };
declare type k8s$NetworkPolicy = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$NetworkPolicySpec;
};
declare type k8s$NetworkPolicyEgressRule = {
  ports?: Array<k8s$NetworkPolicyPort>;
  to?: Array<k8s$NetworkPolicyPeer>;
};
declare type k8s$NetworkPolicyIngressRule = {
  from?: Array<k8s$NetworkPolicyPeer>;
  ports?: Array<k8s$NetworkPolicyPort>;
};
declare type k8s$NetworkPolicyList = {
  apiVersion?: string;
  items: Array<k8s$NetworkPolicy>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$NetworkPolicyPeer = {
  ipBlock?: k8s$IPBlock;
  namespaceSelector?: k8s$LabelSelector;
  podSelector?: k8s$LabelSelector;
};
declare type k8s$NetworkPolicyPort = {
  port?: k8s$IntOrString;
  protocol?: string;
};
declare type k8s$NetworkPolicySpec = {
  egress?: Array<k8s$NetworkPolicyEgressRule>;
  ingress?: Array<k8s$NetworkPolicyIngressRule>;
  podSelector: k8s$LabelSelector;
  policyTypes?: Array<string>;
};
declare type k8s$Eviction = {
  apiVersion?: string;
  deleteOptions?: k8s$DeleteOptions;
  kind?: string;
  metadata?: k8s$ObjectMeta;
};
declare type k8s$PodDisruptionBudget = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$PodDisruptionBudgetSpec;
  status?: k8s$PodDisruptionBudgetStatus;
};
declare type k8s$PodDisruptionBudgetList = {
  apiVersion?: string;
  items: Array<k8s$PodDisruptionBudget>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$PodDisruptionBudgetSpec = {
  maxUnavailable?: k8s$IntOrString;
  minAvailable?: k8s$IntOrString;
  selector?: k8s$LabelSelector;
};
declare type k8s$PodDisruptionBudgetStatus = {
  currentHealthy: number;
  desiredHealthy: number;
  disruptedPods: object;
  disruptionsAllowed: number;
  expectedPods: number;
  observedGeneration?: number;
};
declare type k8s$ClusterRole = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  rules: Array<k8s$PolicyRule>;
};
declare type k8s$ClusterRoleBinding = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  roleRef: k8s$RoleRef;
  subjects: Array<k8s$Subject>;
};
declare type k8s$ClusterRoleBindingList = {
  apiVersion?: string;
  items: Array<k8s$ClusterRoleBinding>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$ClusterRoleList = {
  apiVersion?: string;
  items: Array<k8s$ClusterRole>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$PolicyRule = {
  apiGroups?: Array<string>;
  nonResourceURLs?: Array<string>;
  resourceNames?: Array<string>;
  resources?: Array<string>;
  verbs: Array<string>;
};
declare type k8s$Role = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  rules: Array<k8s$PolicyRule>;
};
declare type k8s$RoleBinding = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  roleRef: k8s$RoleRef;
  subjects: Array<k8s$Subject>;
};
declare type k8s$RoleBindingList = {
  apiVersion?: string;
  items: Array<k8s$RoleBinding>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$RoleList = {
  apiVersion?: string;
  items: Array<k8s$Role>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$RoleRef = { apiGroup: string; kind: string; name: string };
declare type k8s$Subject = {
  apiGroup?: string;
  kind: string;
  name: string;
  namespace?: string;
};
declare type k8s$StorageClass = {
  allowVolumeExpansion?: boolean;
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  mountOptions?: Array<string>;
  parameters?: object;
  provisioner: string;
  reclaimPolicy?: string;
};
declare type k8s$StorageClassList = {
  apiVersion?: string;
  items: Array<k8s$StorageClass>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$CustomResourceDefinition = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$CustomResourceDefinitionSpec;
  status?: k8s$CustomResourceDefinitionStatus;
};
declare type k8s$CustomResourceDefinitionCondition = {
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$CustomResourceDefinitionList = {
  apiVersion?: string;
  items: Array<k8s$CustomResourceDefinition>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$CustomResourceDefinitionNames = {
  kind: string;
  listKind?: string;
  plural: string;
  shortNames?: Array<string>;
  singular?: string;
};
declare type k8s$CustomResourceDefinitionSpec = {
  group: string;
  names: k8s$CustomResourceDefinitionNames;
  scope: string;
  validation?: k8s$CustomResourceValidation;
  version: string;
};
declare type k8s$CustomResourceDefinitionStatus = {
  acceptedNames: k8s$CustomResourceDefinitionNames;
  conditions: Array<k8s$CustomResourceDefinitionCondition>;
};
declare type k8s$CustomResourceValidation = {
  openAPIV3Schema?: k8s$JSONSchemaProps;
};
declare type k8s$ExternalDocumentation = {
  description?: string;
  url?: string;
};
declare type k8s$JSON = { Raw: string };
declare type k8s$JSONSchemaProps = {
  $ref?: string;
  $schema?: string;
  additionalItems?: k8s$JSONSchemaPropsOrBool;
  additionalProperties?: k8s$JSONSchemaPropsOrBool;
  allOf?: Array<k8s$JSONSchemaProps>;
  anyOf?: Array<k8s$JSONSchemaProps>;
  default?: k8s$JSON;
  definitions?: object;
  dependencies?: object;
  description?: string;
  enum?: Array<k8s$JSON>;
  example?: k8s$JSON;
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  externalDocs?: k8s$ExternalDocumentation;
  format?: string;
  id?: string;
  items?: k8s$JSONSchemaPropsOrArray;
  maxItems?: number;
  maxLength?: number;
  maxProperties?: number;
  maximum?: number;
  minItems?: number;
  minLength?: number;
  minProperties?: number;
  minimum?: number;
  multipleOf?: number;
  not?: k8s$JSONSchemaProps;
  oneOf?: Array<k8s$JSONSchemaProps>;
  pattern?: string;
  patternProperties?: object;
  properties?: object;
  required?: Array<string>;
  title?: string;
  type?: string;
  uniqueItems?: boolean;
};
declare type k8s$JSONSchemaPropsOrArray = {
  JSONSchemas: Array<k8s$JSONSchemaProps>;
  Schema: k8s$JSONSchemaProps;
};
declare type k8s$JSONSchemaPropsOrBool = {
  Allows: boolean;
  Schema: k8s$JSONSchemaProps;
};
declare type k8s$JSONSchemaPropsOrStringArray = {
  Property: Array<string>;
  Schema: k8s$JSONSchemaProps;
};
declare type k8s$Quantity = string;
declare type k8s$APIGroup = {
  apiVersion?: string;
  kind?: string;
  name: string;
  preferredVersion?: k8s$GroupVersionForDiscovery;
  serverAddressByClientCIDRs: Array<k8s$ServerAddressByClientCIDR>;
  versions: Array<k8s$GroupVersionForDiscovery>;
};
declare type k8s$APIGroupList = {
  apiVersion?: string;
  groups: Array<k8s$APIGroup>;
  kind?: string;
};
declare type k8s$APIResource = {
  categories?: Array<string>;
  group?: string;
  kind: string;
  name: string;
  namespaced: boolean;
  shortNames?: Array<string>;
  singularName: string;
  verbs: Array<string>;
  version?: string;
};
declare type k8s$APIResourceList = {
  apiVersion?: string;
  groupVersion: string;
  kind?: string;
  resources: Array<k8s$APIResource>;
};
declare type k8s$APIVersions = {
  apiVersion?: string;
  kind?: string;
  serverAddressByClientCIDRs: Array<k8s$ServerAddressByClientCIDR>;
  versions: Array<string>;
};
declare type k8s$DeleteOptions = {
  apiVersion?: string;
  gracePeriodSeconds?: number;
  kind?: string;
  orphanDependents?: boolean;
  preconditions?: k8s$Preconditions;
  propagationPolicy?: string;
};
declare type k8s$GroupVersionForDiscovery = {
  groupVersion: string;
  version: string;
};
declare type k8s$Initializer = { name: string };
declare type k8s$Initializers = {
  pending: Array<k8s$Initializer>;
  result?: k8s$Status;
};
declare type k8s$LabelSelector = {
  matchExpressions?: Array<k8s$LabelSelectorRequirement>;
  matchLabels?: object;
};
declare type k8s$LabelSelectorRequirement = {
  key: string;
  operator: string;
  values?: Array<string>;
};
declare type k8s$ListMeta = {
  continue?: string;
  resourceVersion?: string;
  selfLink?: string;
};
declare type k8s$ObjectMeta = {
  annotations?: object;
  clusterName?: string;
  creationTimestamp?: k8s$Time;
  deletionGracePeriodSeconds?: number;
  deletionTimestamp?: k8s$Time;
  finalizers?: Array<string>;
  generateName?: string;
  generation?: number;
  initializers?: k8s$Initializers;
  labels?: object;
  name?: string;
  namespace?: string;
  ownerReferences?: Array<k8s$OwnerReference>;
  resourceVersion?: string;
  selfLink?: string;
  uid?: string;
};
declare type k8s$OwnerReference = {
  apiVersion: string;
  blockOwnerDeletion?: boolean;
  controller?: boolean;
  kind: string;
  name: string;
  uid: string;
};
declare type k8s$Patch = {};
declare type k8s$Preconditions = { uid?: string };
declare type k8s$ServerAddressByClientCIDR = {
  clientCIDR: string;
  serverAddress: string;
};
declare type k8s$Status = {
  apiVersion?: string;
  code?: number;
  details?: k8s$StatusDetails;
  kind?: string;
  message?: string;
  metadata?: k8s$ListMeta;
  reason?: string;
  status?: string;
};
declare type k8s$StatusCause = {
  field?: string;
  message?: string;
  reason?: string;
};
declare type k8s$StatusDetails = {
  causes?: Array<k8s$StatusCause>;
  group?: string;
  kind?: string;
  name?: string;
  retryAfterSeconds?: number;
  uid?: string;
};
declare type k8s$Time = string;
declare type k8s$WatchEvent = { object: k8s$RawExtension; type: string };
declare type k8s$RawExtension = { Raw: string };
declare type k8s$IntOrString = string;
declare type k8s$Info = {
  buildDate: string;
  compiler: string;
  gitCommit: string;
  gitTreeState: string;
  gitVersion: string;
  goVersion: string;
  major: string;
  minor: string;
  platform: string;
};
declare type k8s$APIService = {
  apiVersion?: string;
  kind?: string;
  metadata?: k8s$ObjectMeta;
  spec?: k8s$APIServiceSpec;
  status?: k8s$APIServiceStatus;
};
declare type k8s$APIServiceCondition = {
  lastTransitionTime?: k8s$Time;
  message?: string;
  reason?: string;
  status: string;
  type: string;
};
declare type k8s$APIServiceList = {
  apiVersion?: string;
  items: Array<k8s$APIService>;
  kind?: string;
  metadata?: k8s$ListMeta;
};
declare type k8s$APIServiceSpec = {
  caBundle: string;
  group?: string;
  groupPriorityMinimum: number;
  insecureSkipTLSVerify?: boolean;
  service: k8s$ServiceReference;
  version?: string;
  versionPriority: number;
};
declare type k8s$APIServiceStatus = {
  conditions?: Array<k8s$APIServiceCondition>;
};
declare type k8s$ServiceReference = { name?: string; namespace?: string };
